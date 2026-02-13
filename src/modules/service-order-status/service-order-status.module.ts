import { Module } from '@nestjs/common';
import { ServiceOrderStatusRepository } from './repository';
import { CreateServiceOrderStatusUseCase } from './use-cases';

@Module({
  imports: [],
  controllers: [],
  providers: [
    CreateServiceOrderStatusUseCase,
    ServiceOrderStatusRepository,
    {
      provide: 'ServiceOrderStatusRepository',
      useExisting: ServiceOrderStatusRepository,
    },
  ],
  exports: [
    CreateServiceOrderStatusUseCase,
    ServiceOrderStatusRepository,
    {
      provide: 'ServiceOrderStatusRepository',
      useExisting: ServiceOrderStatusRepository,
    },
  ],
})
export class ServiceOrderStatusModule {}
