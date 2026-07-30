import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class AllocateGoalDto {
  @ApiProperty({ description: 'Valor a alocar para a meta', example: 500 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({ description: 'Nota opcional', example: 'Economizei no almoço essa semana' })
  @IsOptional()
  @IsString()
  note?: string;
}
