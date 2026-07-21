import { ServiceOrderStatusModule } from '@modules/service-order-status';
import { UserModule } from '@modules/user';
import { Module } from '@nestjs/common';
import { ServiceOrderRepository } from './repository';
import { ServiceOrderController } from './service-order.controller';
import { ServiceOrderExportProcessor } from './jobs/service-order-export.processor';
import { ServiceOrderPdfGenerator } from './pdf/service-order-pdf.generator';
import {
  CreateServiceOrderUseCase,
  FindAllServiceOrderUseCase,
  FindServiceOrderByIdUseCase,
  FindServiceOrderByUserIdUseCase,
  ExportServiceOrderCsvUseCase,
  ExportServiceOrderPdfUseCase,
  GetDashboardSummaryUseCase,
  GetServiceOrderAttachmentUseCase,
  GetSummaryChartsUseCase,
  UpdateServiceOrderUseCase,
} from './use-cases';

@Module({
  imports: [ServiceOrderStatusModule, UserModule],
  controllers: [ServiceOrderController],
  providers: [
    FindAllServiceOrderUseCase,
    FindServiceOrderByIdUseCase,
    FindServiceOrderByUserIdUseCase,
    ExportServiceOrderCsvUseCase,
    ExportServiceOrderPdfUseCase,
    GetDashboardSummaryUseCase,
    GetServiceOrderAttachmentUseCase,
    GetSummaryChartsUseCase,
    CreateServiceOrderUseCase,
    UpdateServiceOrderUseCase,
    ServiceOrderPdfGenerator,
    ServiceOrderRepository,
    ServiceOrderExportProcessor,
    {
      provide: 'ServiceOrderRepository',
      useExisting: ServiceOrderRepository,
    },
  ],
  exports: [],
})
export class ServiceOrderModule {}
