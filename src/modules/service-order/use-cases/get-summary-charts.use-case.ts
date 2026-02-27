import { Inject, Injectable } from '@nestjs/common';
import { ServiceOrderRepository } from '../repository';

@Injectable()
export class GetSummaryChartsUseCase {
  constructor(
    @Inject('ServiceOrderRepository')
    private readonly serviceOrderRepository: ServiceOrderRepository,
  ) {}

  async execute(): Promise<{
    ordersByDepartment: { department: string; total: number }[];
    percentageByStatus: { status: string; percentage: number }[];
    avgResolutionTimeByDepartment: { department: string; avg: number }[];
  }> {
    return await this.serviceOrderRepository.getSummaryCharts();
  }
}
