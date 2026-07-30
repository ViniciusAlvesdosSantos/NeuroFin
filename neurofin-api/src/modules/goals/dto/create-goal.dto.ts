import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';

export class CreateGoalDto {
  @ApiProperty({ description: 'Nome da meta', example: 'Viagem ao Japão' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Valor alvo da meta', example: 15000 })
  @IsNumber()
  @Min(1)
  targetAmount: number;

  @ApiPropertyOptional({ description: 'Data limite', example: '2027-06-15' })
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @ApiPropertyOptional({ description: 'Ícone emoji', example: '✈️' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ description: 'Cor hex', example: '#6366F1' })
  @IsOptional()
  @IsString()
  color?: string;
}
