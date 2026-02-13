import { ServiceOrderStatusEntity } from '@modules/service-order-status';
import { Department } from 'types/department';
import { ServiceOrderPriority, ServiceOrderType } from 'types/service-order';

export class ServiceOrder {
  constructor(
    public readonly id: string,
    public readonly orderId: string,
    public readonly subject: string,
    public readonly description: string,
    public readonly type: ServiceOrderType,
    public readonly department: Department,
    public readonly requester: Requester,
    public readonly priority: ServiceOrderPriority,
    public readonly serviceOrderStatus: ServiceOrderStatusEntity[],
    public readonly createdAt: Date,
    public readonly attachment?: string,
  ) {}
}

class Requester {
  constructor(
    public readonly id: string,
    public readonly name: string,
  ) {}
}

export class ListServiceOrder {
  constructor(
    public readonly id: string,
    public readonly orderId: string,
    public readonly subject: string,
    public readonly description: string,
    public readonly type: ServiceOrderType,
    public readonly department: Department,
    public readonly requester: Requester,
    public readonly priority: ServiceOrderPriority,
    public readonly serviceOrderStatus: ServiceOrderStatusEntity,
    public readonly createdAt: Date,
    public readonly attachment?: string,
  ) {}
}
