import { Sanitize } from '@common/decorators';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
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

  @IsNotEmpty()
  @IsEnum(serviceOrderTypes, { message: 'Tipo de ordem de serviço inválido' })
  type: ServiceOrderType;

  @IsNotEmpty()
  @IsEnum(serviceOrderPriorities, {
    message: 'Prioridade de ordem de serviço inválida',
  })
  priority: ServiceOrderPriority;

  @IsNotEmpty()
  @IsEnum(departments, { message: 'Departamento inválido' })
  department: Department;
}
