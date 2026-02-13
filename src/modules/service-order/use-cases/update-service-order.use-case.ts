import { CreateServiceOrderStatusUseCase } from '@modules/service-order-status';
import { Injectable } from '@nestjs/common';
import { UpdateServiceOrderDTO } from '../dto';
import { FindServiceOrderByIdUseCase } from './find-service-order-by-id.use-case';

@Injectable()
export class UpdateServiceOrderUseCase {
  constructor(
    private readonly findServiceOrderByIdUseCase: FindServiceOrderByIdUseCase,
    private readonly createServiceOrderStatusUseCase: CreateServiceOrderStatusUseCase,
  ) {}

  async execute(
    id: string,
    dto: Omit<UpdateServiceOrderDTO, 'serviceOrderId'>,
  ): Promise<void> {
    await this.findServiceOrderByIdUseCase.execute(id);

    await this.createServiceOrderStatusUseCase.execute({
      serviceOrderId: id,
      status: dto.status,
      note: dto.note,
      technicianId: dto.technicianId,
    });
  }
}
