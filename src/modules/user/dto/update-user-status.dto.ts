import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateUserStatusDTO {
  @ApiProperty({
    description: 'Define se o usuário está ativo ou inativo',
    example: true,
  })
  @IsBoolean()
  isActive: boolean;
}
