import { ServiceOrderStatusModule } from '@modules/service-order-status';
import { Module } from '@nestjs/common';
import { ServiceOrderRepository } from './repository';
import { ServiceOrderController } from './service-order.controller';
import {
  CreateServiceOrderUseCase,
  FindAllServiceOrderUseCase,
  FindServiceOrderByIdUseCase,
  FindServiceOrderByTechnicianUseCase,
  GetDashboardSummaryUseCase,
  GetSummaryChartsUseCase,
  UpdateServiceOrderUseCase,
} from './use-cases';

@Module({
  imports: [ServiceOrderStatusModule],
  controllers: [ServiceOrderController],
  providers: [
    FindAllServiceOrderUseCase,
    FindServiceOrderByIdUseCase,
    FindServiceOrderByTechnicianUseCase,
    GetDashboardSummaryUseCase,
    GetSummaryChartsUseCase,
    CreateServiceOrderUseCase,
    UpdateServiceOrderUseCase,
    ServiceOrderRepository,
    {
      provide: 'ServiceOrderRepository',
      useExisting: ServiceOrderRepository,
    },
  ],
  exports: [],
})
export class ServiceOrderModule {}
