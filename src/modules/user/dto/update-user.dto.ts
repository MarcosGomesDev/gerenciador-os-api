import { Sanitize } from '@common/decorators';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { Department, departments } from 'types/department';
import { Role, roles } from 'types/role';

export class UpdateUserDTO {
  @IsOptional()
  @IsString()
  @Sanitize()
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  email?: string;

  @IsOptional()
  @IsString()
  @Sanitize()
  taxIdentifier?: string;

  @IsOptional()
  @IsString()
  @IsStrongPassword(
    {},
    {
      message:
        'A senha deve ter no mínimo 8 caracteres, incluindo letras maiúsculas, minúsculas e números',
    },
  )
  password?: string;

  @ApiProperty({
    enum: Object.values(roles),
    enumName: 'Role',
    required: false,
  })
  @IsOptional()
  @IsEnum(roles, { message: 'Função inválida' })
  role?: Role;

  @ApiProperty({
    enum: Object.values(departments),
    enumName: 'Department',
    required: false,
  })
  @IsOptional()
  @IsEnum(departments, { message: 'Departamento inválido' })
  department?: Department;

  @IsOptional()
  @IsBoolean()
  isFirstAccess?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
