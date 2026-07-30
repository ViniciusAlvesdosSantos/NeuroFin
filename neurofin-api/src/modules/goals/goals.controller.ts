import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { AllocateGoalDto } from './dto/allocate-goal.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';

@ApiTags('Metas')
@Controller('goals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar nova meta' })
  @ApiResponse({ status: 201, description: 'Meta criada com sucesso' })
  create(@Request() req: RequestWithUser, @Body() dto: CreateGoalDto) {
    return this.goalsService.create(req.user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar metas do usuário' })
  @ApiQuery({ name: 'includeArchived', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Lista de metas retornada' })
  findAll(
    @Request() req: RequestWithUser,
    @Query('includeArchived') includeArchived?: string,
  ) {
    return this.goalsService.findAll(req.user.sub, includeArchived === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar meta por ID' })
  @ApiParam({ name: 'id', description: 'UUID da meta' })
  @ApiResponse({ status: 200, description: 'Meta encontrada' })
  @ApiResponse({ status: 404, description: 'Meta não encontrada' })
  findOne(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.goalsService.findOne(id, req.user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar meta' })
  @ApiParam({ name: 'id', description: 'UUID da meta' })
  @ApiResponse({ status: 200, description: 'Meta atualizada' })
  update(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateGoalDto,
  ) {
    return this.goalsService.update(id, req.user.sub, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deletar meta' })
  @ApiParam({ name: 'id', description: 'UUID da meta' })
  @ApiResponse({ status: 200, description: 'Meta deletada' })
  remove(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.goalsService.remove(id, req.user.sub);
  }

  @Post(':id/allocate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Alocar dinheiro em uma meta' })
  @ApiParam({ name: 'id', description: 'UUID da meta' })
  @ApiResponse({ status: 200, description: 'Alocação realizada com sucesso' })
  allocate(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: AllocateGoalDto,
  ) {
    return this.goalsService.allocate(id, req.user.sub, dto);
  }
}
