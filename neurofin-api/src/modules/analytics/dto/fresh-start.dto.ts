import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

class AccountBalanceDto {
  @ApiProperty({ description: 'ID da conta', example: 1 })
  @IsNumber()
  accountId: number;

  @ApiProperty({ description: 'Saldo real atual da conta', example: 2500.50 })
  @IsNumber()
  @Min(0)
  realBalance: number;
}

export class FreshStartDto {
  @ApiProperty({
    description: 'Lista de saldos reais para cada conta',
    type: [AccountBalanceDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AccountBalanceDto)
  accountBalances: AccountBalanceDto[];
}
