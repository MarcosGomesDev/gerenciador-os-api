import { Sanitize } from '@common/decorators';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Department, departments } from 'types/department';

export class CreateLocationDTO {
  @IsNotEmpty()
  @IsString()
  @Sanitize()
  name: string;

  @ApiProperty({
    enum: Object.values(departments),
    enumName: 'Department',
  })
  @IsNotEmpty()
  @IsEnum(departments, { message: 'Departamento inválido' })
  department: Department;

  @IsNotEmpty()
  @IsString()
  locationTypeId: string;

  @IsOptional()
  @IsString()
  @Sanitize()
  address?: string;

  @IsOptional()
  @IsString()
  @Sanitize()
  directorate?: string;

  @IsOptional()
  @IsString()
  @Sanitize()
  phone?: string;

  @IsOptional()
  @IsString()
  @Sanitize()
  mobile?: string;
}
