import { ServiceOrderStatus } from 'types/service-order';

export class ServiceOrderStatusEntity {
  constructor(
    public readonly id: string,
    public readonly serviceOrderId: string,
    public readonly status: ServiceOrderStatus,
    public readonly createdAt: Date,
    public readonly note?: string,
    public readonly technician?: Technician,
  ) {}
}

class Technician {
  constructor(
    public readonly id: string,
    public readonly name: string,
  ) {}
}
