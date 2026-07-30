import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { FreshStartDto } from './dto/fresh-start.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('safe-to-spend')
  @ApiOperation({ summary: 'Retorna o valor seguro para gastar hoje' })
  @ApiResponse({ status: 200, description: 'Dados de Safe-to-Spend retornados' })
  getSafeToSpend(@Request() req: RequestWithUser) {
    return this.analyticsService.getSafeToSpend(req.user.sub);
  }

  @Get('last-activity')
  @ApiOperation({ summary: 'Retorna dados de última atividade do usuário' })
  @ApiResponse({ status: 200, description: 'Dados de última atividade retornados' })
  getLastActivity(@Request() req: RequestWithUser) {
    return this.analyticsService.getLastActivity(req.user.sub);
  }

  @Post('fresh-start')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Realiza Fresh Start - Ajuste de saldo para recomeço' })
  @ApiResponse({ status: 200, description: 'Fresh Start realizado com sucesso' })
  freshStart(@Request() req: RequestWithUser, @Body() dto: FreshStartDto) {
    return this.analyticsService.freshStart(req.user.sub, dto.accountBalances);
  }

  @Post('update-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualiza timestamp de último login' })
  updateLastLogin(@Request() req: RequestWithUser) {
    return this.analyticsService.updateLastLogin(req.user.sub);
  }
}
