import { Inject, Injectable } from '@nestjs/common';
import { FindAllFilters } from '../dto';
import { ServiceOrder } from '../entities';
import { ServiceOrderRepository } from '../repository';

@Injectable()
export class FindServiceOrderByUserIdUseCase {
  constructor(
    @Inject('ServiceOrderRepository')
    private readonly serviceOrderRepository: ServiceOrderRepository,
  ) {}

  async execute(
    userId: string,
    filters: FindAllFilters = {},
  ): Promise<{
    data: ServiceOrder[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return await this.serviceOrderRepository.findServiceOrderByUserId(
      userId,
      filters,
    );
  }
}
