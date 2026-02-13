import { Inject, Injectable } from '@nestjs/common';
import { ServiceOrderRepository } from '../repository';
import { ServiceOrder } from '../entities';

@Injectable()
export class FindAllServiceOrderUseCase {
  constructor(
    @Inject('ServiceOrderRepository')
    private readonly serviceOrderRepository: ServiceOrderRepository,
  ) {}

  async execute(): Promise<ServiceOrder[]> {
    return await this.serviceOrderRepository.findAll();
  }
}
