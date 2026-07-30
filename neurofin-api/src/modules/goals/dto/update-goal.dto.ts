import { PartialType } from '@nestjs/swagger';
import { CreateGoalDto } from './create-goal.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateGoalDto extends PartialType(CreateGoalDto) {
  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;
}
