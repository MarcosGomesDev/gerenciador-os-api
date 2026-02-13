import { Sanitize } from '@common/decorators';
import { ApiProperty } from '@nestjs/swagger';
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

  @ApiProperty({
    enum: Object.values(roles),
    enumName: 'Role',
  })
  @IsNotEmpty()
  @IsEnum(roles, { message: 'Função inválida' })
  role: Role;

  @ApiProperty({
    enum: Object.values(departments),
    enumName: 'Department',
  })
  @IsNotEmpty()
  @IsEnum(departments, { message: 'Departamento inválido' })
  department: Department;
}
