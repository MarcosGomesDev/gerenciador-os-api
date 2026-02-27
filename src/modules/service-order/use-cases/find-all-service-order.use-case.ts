import { Inject, Injectable } from '@nestjs/common';
import { FindAllFilters } from '../dto';
import { ServiceOrder } from '../entities';
import { ServiceOrderRepository } from '../repository';

@Injectable()
export class FindAllServiceOrderUseCase {
  constructor(
    @Inject('ServiceOrderRepository')
    private readonly serviceOrderRepository: ServiceOrderRepository,
  ) {}

  async execute(filters: FindAllFilters): Promise<{
    data: ServiceOrder[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return await this.serviceOrderRepository.findAll(filters);
  }
}
