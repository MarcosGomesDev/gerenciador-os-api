import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { Role, roles } from 'types/role';

export class FindUsersByRoleFilters {
  @ApiPropertyOptional({
    enum: [roles.ADMIN, roles.TECHNICIAN],
    enumName: 'Role',
  })
  @IsNotEmpty()
  @IsEnum(
    { ADMIN: roles.ADMIN, TECHNICIAN: roles.TECHNICIAN },
    { message: 'Função inválida. Use ADMIN ou TECHNICIAN.' },
  )
  role: Extract<Role, 'ADMIN' | 'TECHNICIAN'>;

  @ApiPropertyOptional({
    description: 'ID do usuário a excluir da listagem',
  })
  @IsOptional()
  @IsUUID('4')
  excludeUserId?: string;
}
