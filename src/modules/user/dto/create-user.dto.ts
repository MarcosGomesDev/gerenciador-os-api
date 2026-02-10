import { Sanitize } from '@common/decorators';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
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
  @IsEnum(roles, { message: 'Função inválida' })
  role: Role;

  @IsNotEmpty()
  @IsEnum(departments, { message: 'Departamento inválido' })
  department: Department;
}
