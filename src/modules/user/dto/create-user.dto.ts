import { Sanitize } from '@common/decorators';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { Department, departments } from 'types/department';
import { Role, roles } from 'types/role';

export class CreateUserDTO {
  @IsNotEmpty()
  @IsString()
  @Sanitize()
  name: string;

  @IsNotEmpty()
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @IsNotEmpty()
  @IsString()
  taxIdentifier: string;

  @IsNotEmpty()
  @IsString()
  @IsStrongPassword(
    {},
    {
      message:
        'A senha deve ter no mínimo 8 caracteres, incluindo letras maiúsculas, minúsculas e números',
    },
  )
  password: string;

  @IsNotEmpty()
  @IsEnum(roles, { message: 'Função inválida' })
  role: Role;

  @IsNotEmpty()
  @IsEnum(departments, { message: 'Departamento inválido' })
  department: Department;
}
