import { Sanitize } from '@common/decorators';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ServiceOrderStatus, serviceOrderStatuses } from 'types/service-order';

export class CreateServiceOrderStatusDTO {
  @IsNotEmpty()
  @IsEnum(serviceOrderStatuses, {
    message: 'Status de ordem de serviço inválido',
  })
  status: ServiceOrderStatus;

  @IsNotEmpty()
  @IsString()
  @Sanitize()
  serviceOrderId: string;

  @IsOptional()
  @IsString()
  @Sanitize()
  note?: string;

  @IsOptional()
  @IsString()
  @Sanitize()
  technicianId?: string;
}
