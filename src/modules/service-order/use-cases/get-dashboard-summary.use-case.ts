import { Inject, Injectable } from '@nestjs/common';
import { ServiceOrderRepository } from '../repository';

@Injectable()
export class GetDashboardSummaryUseCase {
  constructor(
    @Inject('ServiceOrderRepository')
    private readonly serviceOrderRepository: ServiceOrderRepository,
  ) {}

  async execute(): Promise<{
    totalOrders: {
      total: number;
      percentage: number;
    };
    byStatus: {
      open: number;
      inProgress: number;
      closed: { total: number; percentage: number };
    };
    avgResolutionOrders: number;
    avgResolutionTime: {
      hours: number;
      percentage: number;
    };
  }> {
    return await this.serviceOrderRepository.getDashboardSummary();
  }
}
