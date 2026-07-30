import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LoginPasswordDto {
  @ApiProperty({
    description: 'Email ou CPF do usuário para login',
    example: 'joao@email.com',
    examples: {
      email: {
        value: 'joao@email.com',
        summary: 'Login com email',
      },
      cpf: {
        value: '12345678900',
        summary: 'Login com CPF',
      },
    },
  })
  @IsString()
  identifier: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'MinhaSenh@123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  password: string;
}
