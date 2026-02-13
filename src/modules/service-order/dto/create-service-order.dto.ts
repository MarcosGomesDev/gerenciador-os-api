import { Sanitize } from '@common/decorators';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Department, departments } from 'types/department';
import {
  serviceOrderPriorities,
  ServiceOrderPriority,
  ServiceOrderType,
  serviceOrderTypes,
} from 'types/service-order';

export class CreateServiceOrderDTO {
  @IsNotEmpty()
  @IsString()
  @Sanitize()
  subject: string;

  @IsNotEmpty()
  @IsString()
  @Sanitize()
  description: string;

  @ApiProperty({
    enum: Object.values(serviceOrderTypes),
    enumName: 'ServiceOrderType',
  })
  @IsNotEmpty()
  @IsEnum(serviceOrderTypes, { message: 'Tipo de ordem de serviço inválido' })
  type: ServiceOrderType;

  @ApiProperty({
    enum: Object.values(serviceOrderPriorities),
    enumName: 'ServiceOrderPriority',
  })
  @IsNotEmpty()
  @IsEnum(serviceOrderPriorities, {
    message: 'Prioridade de ordem de serviço inválida',
  })
  priority: ServiceOrderPriority;

  @ApiProperty({
    enum: Object.values(departments),
    enumName: 'Department',
  })
  @IsNotEmpty()
  @IsEnum(departments, { message: 'Departamento inválido' })
  department: Department;
}

export class CreateServiceOrderWithFileDTO extends CreateServiceOrderDTO {
  @ApiProperty({
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  attachment?: any;
}
