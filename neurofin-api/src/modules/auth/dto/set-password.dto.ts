import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class SetPasswordDto {
  @ApiProperty({
    description: 'Nova senha do usuário (mínimo 6 caracteres, deve conter letra maiúscula, minúscula e número)',
    example: 'MinhaSenh@123',
    minLength: 6,
    maxLength: 128,
  })
  @IsString()
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  @MaxLength(128, { message: 'Senha deve ter no máximo 128 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'Senha deve conter ao menos uma letra maiúscula, uma minúscula e um número',
  })
  password: string;

  @ApiProperty({
    description: 'Confirmação da senha',
    example: 'MinhaSenh@123',
  })
  @IsString()
  confirmPassword: string;
}
