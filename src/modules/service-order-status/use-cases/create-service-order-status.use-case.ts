import { Inject, Injectable } from '@nestjs/common';
import { CreateServiceOrderStatusDTO } from '../dto';
import {
  ServiceOrderLabUpdates,
  ServiceOrderStatusRepository,
} from '../repository';

@Injectable()
export class CreateServiceOrderStatusUseCase {
  constructor(
    @Inject('ServiceOrderStatusRepository')
    private readonly serviceOrderStatusRepository: ServiceOrderStatusRepository,
  ) {}

  async execute(
    dto: CreateServiceOrderStatusDTO,
    orderUpdates?: ServiceOrderLabUpdates,
  ) {
    return await this.serviceOrderStatusRepository.create(dto, orderUpdates);
  }
}
