import { ServiceOrderPriority, ServiceOrderStatus } from 'types/service-order';

export interface FindAllFilters {
  page?: number;
  limit?: number;
  department?: string;
  priority?: ServiceOrderPriority;
  technicianName?: string;
  status?: ServiceOrderStatus;
  searchTerm?: string;
}
