import { Inject, Injectable } from '@nestjs/common';
import { ServiceOrderRepository } from '../repository';
import { ServiceOrder } from '../entities';
import { NotFoundException } from '@common/filters';

@Injectable()
export class FindServiceOrderByIdUseCase {
  constructor(
    @Inject('ServiceOrderRepository')
    private readonly serviceOrderRepository: ServiceOrderRepository,
  ) {}

  async execute(id: string): Promise<ServiceOrder> {
    const serviceOrder = await this.serviceOrderRepository.findById(id);

    if (!serviceOrder) {
      throw new NotFoundException('Ordem de serviço não encontrada');
    }

    return serviceOrder;
  }
}
