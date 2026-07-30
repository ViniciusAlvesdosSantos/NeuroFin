import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserStatus, UserPlan } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/database/prisma.service';
import { MailService } from 'src/mail/mail.service';
import { CacheService } from 'src/common/cache/cache.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { LoginPasswordDto } from '../dto/login-password.dto';
import { SetPasswordDto } from '../dto/set-password.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { AccountsService } from 'src/modules/accounts/accounts.service';
import { CategoryIcon } from 'src/common/enums/category-icons.enum';
import { CategoriesService } from 'src/modules/categories-services/categories.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private accountService: AccountsService,
    private categoryService: CategoriesService,
    private cacheService: CacheService,
  ) {}

  // ========================================
  // HELPERS DE CACHE
  // ========================================

  /**
   * Busca usuário por ID usando cache.
   * Se encontrado no cache, retorna imediatamente sem ir ao banco.
   */
  private async findUserByIdCached(userId: number) {
    const cacheKey = `user:${userId}:profile`;
    const cached = this.cacheService.get<any>(cacheKey);
    if (cached) {
      this.logger.debug(`Cache HIT: user:${userId}`);
      return cached;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (user) {
      this.cacheService.set(cacheKey, user, CacheService.TTL.USER_BY_ID);
    }

    return user;
  }

  /**
   * Busca usuário por email ou CPF (identifier) usando cache.
   */
  private async findUserByIdentifierCached(identifier: string) {
    const cacheKey = `user:identifier:${identifier}`;
    const cached = this.cacheService.get<any>(cacheKey);
    if (cached) {
      this.logger.debug(`Cache HIT: identifier:${identifier}`);
      return cached;
    }

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { cpf: identifier },
        ],
      },
    });

    if (user) {
      this.cacheService.set(cacheKey, user, CacheService.TTL.USER_BY_EMAIL);
    }

    return user;
  }

  /**
   * Invalida todos os caches de um usuário específico.
   */
  private invalidateUserCache(userId: number, email?: string | null, cpf?: string | null) {
    this.cacheService.invalidateByPrefix(`user:${userId}`);
    if (email) this.cacheService.del(`user:identifier:${email}`);
    if (cpf) this.cacheService.del(`user:identifier:${cpf}`);
  }

  /**
   * Gera os tokens de acesso e refresh para um usuário.
   */
  private generateTokens(user: { id: number; email: string }) {
    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        type: 'access',
      },
      {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRATION', '1h'),
      },
    );

    const refreshToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        type: 'refresh',
      },
      {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION', '7d'),
      },
    );

    return { accessToken, refreshToken };
  }

  // ========================================
  // CADASTRO (PRÉ-REGISTRO)
  // ========================================

  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });
    if (existingEmail) {
      throw new ConflictException(
        'O EMAIL informado já possui uma conta vinculada',
      );
    }

    // Validar CPF único
    const existingCpf = await this.prisma.user.findUnique({
      where: { cpf: registerDto.cpf },
    });
    if (existingCpf) {
      throw new ConflictException(
        'O CPF informado já possui uma conta vinculada',
      );
    }

    // Validar telefone único
    const existingPhoneNumber = await this.prisma.user.findUnique({
      where: { phone: registerDto.phone },
    });
    if (existingPhoneNumber) {
      throw new ConflictException(
        'Número de telefone informado já possui uma conta vinculada',
      );
    }

    // Hash da senha se fornecida
    let hashedPassword: string | undefined;
    if (registerDto.password) {
      hashedPassword = await bcrypt.hash(registerDto.password, 12);
    }

    // ✅ Criar usuário com status PENDING (ainda não verificado)
    const user = await this.prisma.user.create({
      data: {
        name: registerDto.name,
        email: registerDto.email,
        cpf: registerDto.cpf,
        phone: registerDto.phone,
        status: UserStatus.PENDING,
        isEmailVerified: false,
        otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
        plan: UserPlan.FREE,
        password: hashedPassword,
      },
    });

    // Gerar token de verificação com dados do registro
    const tokenVerification = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        name: user.name,
        cpf: user.cpf,
        phone: user.phone,
        type: 'email-verification',
      },
      {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: '24h',
      },
    );

    const frontendUrl = this.configService.get('FRONTEND_URL');
    const verificationUrl = `${frontendUrl}/auth/verify-email?token=${tokenVerification}`;

    await this.mailService.sendVerificationEmail(user.email, verificationUrl);

    return {
      message: 'Cadastro realizado! Verifique seu email para ativar sua conta.',
    };
  }

  // ========================================
  // VERIFICAÇÃO DE EMAIL (CRIAR CONTA E CATEGORIAS)
  // ========================================

  async verifyEmail(token: string) {
    let userId: number;
    let email: string;

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      if (payload.type !== 'email-verification') {
        throw new Error('Tipo de token inválido');
      }

      userId = payload.sub;
      email = payload.email;
    } catch (error) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }

    const user = await this.findUserByIdCached(userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email já verificado');
    }

    if (user.email !== email) {
      throw new UnauthorizedException('Token inválido');
    }

    // ✅ Atualizar usuário para ACTIVE e verificado
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isEmailVerified: true,
        status: UserStatus.ACTIVE,
      },
    });

    // Invalidar cache após update
    this.invalidateUserCache(userId, user.email, user.cpf);

    // ✅ CRIAR CONTA PADRÃO após verificação
    await this.accountService.create(userId, {
      accountName: 'Minha Carteira',
      color: '#4CAF50',
      icon: CategoryIcon.SALARY,
      balance: '0',
    });

    // ✅ CRIAR CATEGORIAS PADRÃO após verificação
    await this.categoryService.createDefaultCategories(userId);
  }

  async resendVerification(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email já verificado');
    }

    const verificationToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        name: user.name,
        cpf: user.cpf,
        phone: user.phone,
        type: 'email-verification',
      },
      {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: '24h',
      },
    );

    const frontendUrl = this.configService.get('FRONTEND_URL');
    const verificationUrl = `${frontendUrl}/auth/verify-email?token=${verificationToken}`;

    await this.mailService.sendVerificationEmail(user.email, verificationUrl);

    return {
      message: 'Novo link de verificação enviado para seu email',
    };
  }

  // ========================================
  // LOGIN COM OTP
  // ========================================

  async requestLogin(requestLoginDto: LoginDto): Promise<{ message: string }> {
    const user = await this.findUserByIdentifierCached(requestLoginDto.identifier);

    if (!user) {
      throw new NotFoundException('Email ou CPF não encontrado');
    }
    
    if (!user.isEmailVerified) {
      throw new UnauthorizedException(
        'Email não verificado. Verifique seu email antes de fazer login.',
      );
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedException('Usuário bloqueado');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode: otp,
        otpExpiresAt: expiresAt,
      },
    });

    // Invalidar cache pois OTP mudou
    this.invalidateUserCache(user.id, user.email, user.cpf);

    await this.mailService.sendLoginOtp(user.email, otp);

    return { message: 'Código enviado para o e-mail' };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    // Buscar do banco (não do cache) pois precisa do OTP atualizado
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: verifyOtpDto.identifier },
          { cpf: verifyOtpDto.identifier },
        ],
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Email não verificado');
    }

    if (!user.otpCode || !user.otpExpiresAt) {
      throw new UnauthorizedException('Nenhum código foi solicitado');
    }

    if (user.otpCode !== verifyOtpDto.otpCode) {
      throw new UnauthorizedException('Código inválido');
    }

    if (new Date() > user.otpExpiresAt) {
      throw new UnauthorizedException('Código expirado');
    }

    const isFirstLogin = user.isFirtLogin;

    if (isFirstLogin) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          isFirtLogin: false,
          otpCode: undefined,
          otpExpiresAt: undefined,
        },
      });
    } else {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          otpCode: undefined,
          otpExpiresAt: undefined,
        },
      });
    }

    // Invalidar cache após login
    this.invalidateUserCache(user.id, user.email, user.cpf);

    const { accessToken, refreshToken } = this.generateTokens(user);

    return {
      accessToken,
      refreshToken,
      expiresIn: 3600,
      tokenType: 'Bearer',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isFirstLogin: user.isFirtLogin,
      },
    };
  }

  // ========================================
  // LOGIN COM SENHA
  // ========================================

  async loginWithPassword(loginPasswordDto: LoginPasswordDto) {
    const user = await this.findUserByIdentifierCached(loginPasswordDto.identifier);

    if (!user) {
      throw new NotFoundException('Email ou CPF não encontrado');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException(
        'Email não verificado. Verifique seu email antes de fazer login.',
      );
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedException('Usuário bloqueado');
    }

    if (!user.password) {
      throw new BadRequestException(
        'Esta conta não possui senha cadastrada. Use o login por OTP ou cadastre uma senha.',
      );
    }

    const isPasswordValid = await bcrypt.compare(
      loginPasswordDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Senha incorreta');
    }

    const isFirstLogin = user.isFirtLogin;

    if (isFirstLogin) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { isFirtLogin: false },
      });
      this.invalidateUserCache(user.id, user.email, user.cpf);
    }

    const { accessToken, refreshToken } = this.generateTokens(user);

    return {
      accessToken,
      refreshToken,
      expiresIn: 3600,
      tokenType: 'Bearer',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isFirstLogin: isFirstLogin,
      },
    };
  }

  // ========================================
  // DEFINIR / ALTERAR SENHA
  // ========================================

  async setPassword(userId: number, setPasswordDto: SetPasswordDto) {
    if (setPasswordDto.password !== setPasswordDto.confirmPassword) {
      throw new BadRequestException('As senhas não conferem');
    }

    const user = await this.findUserByIdCached(userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const hashedPassword = await bcrypt.hash(setPasswordDto.password, 12);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Invalidar cache após mudança de senha
    this.invalidateUserCache(userId, user.email, user.cpf);

    return { message: 'Senha definida com sucesso' };
  }

  // ========================================
  // REFRESH TOKEN
  // ========================================

  async refreshToken(refreshToken: string) {
    let userId: number;
    let email: string;

    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      if (payload.type !== 'refresh') {
        throw new Error('Token inválido');
      }

      userId = payload.sub;
      email = payload.email;
    } catch (error) {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }

    const user = await this.findUserByIdCached(userId);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedException('Usuário bloqueado');
    }

    const { accessToken: newAccessToken } = this.generateTokens(user);

    return {
      accessToken: newAccessToken,
      refreshToken: refreshToken, // Mantém o mesmo refresh token
      expiresIn: 3600,
      tokenType: 'Bearer',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  // ========================================
  // VALIDAR USUÁRIO
  // ========================================

  async validateUser(userId: number) {
    const cacheKey = `user:${userId}:validation`;
    const cached = this.cacheService.get<any>(cacheKey);
    if (cached) return cached;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        phone: true,
        status: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedException('Usuário bloqueado');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Email não verificado');
    }

    // Cachear resultado de validação
    this.cacheService.set(cacheKey, user, CacheService.TTL.USER_VALIDATION);

    return user;
  }
}
