import {
  ServiceOrderStatusEntity,
  Technician,
} from '@modules/service-order-status';
import { Department } from 'types/department';
import {
  ServiceOrderPriority,
  ServiceOrderStatus,
  ServiceOrderType,
} from 'types/service-order';

export class ServiceOrder {
  constructor(
    public readonly id: string,
    public readonly orderId: string,
    public readonly subject: string,
    public readonly description: string,
    public readonly type: ServiceOrderType,
    public readonly department: Department,
    public readonly requester: string,
    public readonly priority: ServiceOrderPriority,
    public readonly status: ServiceOrderStatus,
    public readonly serviceOrderStatus: ServiceOrderStatusEntity[],
    public readonly createdAt: Date,
    public readonly attachment?: string,
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
    public readonly requester: string,
    public readonly priority: ServiceOrderPriority,
    public readonly status: ServiceOrderStatus,
    public readonly createdAt: Date,
    public readonly attachment?: string,
    public readonly technician?: Technician,
    public readonly finishedTime?: string,
  ) {}
}
