import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class DeleteUserDTO {
  @ApiProperty({
    description: 'ID do usuário que receberá os vínculos do usuário excluído',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty()
  @IsUUID('4', { message: 'transferToUserId inválido' })
  transferToUserId: string;
}
