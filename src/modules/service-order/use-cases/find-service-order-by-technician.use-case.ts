import { Inject, Injectable } from '@nestjs/common';
import { FindAllFilters } from '../dto';
import { ServiceOrder } from '../entities';
import { ServiceOrderRepository } from '../repository';

@Injectable()
export class FindServiceOrderByTechnicianUseCase {
  constructor(
    @Inject('ServiceOrderRepository')
    private readonly serviceOrderRepository: ServiceOrderRepository,
  ) {}

  async execute(
    technicianId: string,
    filters: FindAllFilters = {},
  ): Promise<{
    data: ServiceOrder[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return await this.serviceOrderRepository.findServiceOrderByTechnician(
      technicianId,
      filters,
    );
  }
}
