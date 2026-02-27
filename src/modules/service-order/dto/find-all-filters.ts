import { ServiceOrderPriority, ServiceOrderStatus } from 'types/service-order';

export interface FindAllFilters {
  page?: number;
  limit?: number;
  orderId?: string;
  department?: string;
  requesterName?: string;
  priority?: ServiceOrderPriority;
  technicianName?: string;
  subject?: string;
  status?: ServiceOrderStatus;
}
