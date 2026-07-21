import { Module } from '@nestjs/common';
import { PatrimonyRepository } from './repository';
import {
  CreatePatrimonyUseCase,
  DeletePatrimonyUseCase,
  FindAllPatrimoniesUseCase,
  FindPatrimonyByIdUseCase,
  UpdatePatrimonyUseCase,
} from './use-cases';
import { PatrimonyController } from './patrimony.controller';

@Module({
  imports: [],
  controllers: [PatrimonyController],
  providers: [
    FindAllPatrimoniesUseCase,
    FindPatrimonyByIdUseCase,
    CreatePatrimonyUseCase,
    UpdatePatrimonyUseCase,
    DeletePatrimonyUseCase,
    PatrimonyRepository,
    {
      provide: 'PatrimonyRepository',
      useExisting: PatrimonyRepository,
    },
  ],
  exports: [
    PatrimonyRepository,
    FindPatrimonyByIdUseCase,
    {
      provide: 'PatrimonyRepository',
      useExisting: PatrimonyRepository,
    },
  ],
})
export class PatrimonyModule {}
