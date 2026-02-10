import { Sanitize } from '@common/decorators';
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

  @IsOptional()
  @IsEnum(roles, { message: 'Função inválida' })
  role?: Role;

  @IsOptional()
  @IsEnum(departments, { message: 'Departamento inválido' })
  department?: Department;

  @IsOptional()
  @IsBoolean()
  isFirstAccess?: boolean;
}
