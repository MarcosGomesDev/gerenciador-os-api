import { CreateServiceOrderStatusDTO } from '@modules/service-order-status';
import { OmitType } from '@nestjs/swagger';

export class UpdateServiceOrderDTO extends OmitType(
  CreateServiceOrderStatusDTO,
  ['serviceOrderId'] as const,
) {}
