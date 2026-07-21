import { Module } from '@nestjs/common';
import { PatrimonyTypeRepository } from './repository';
import {
  CreatePatrimonyTypeUseCase,
  DeletePatrimonyTypeUseCase,
  FindAllPatrimonyTypesUseCase,
  FindPatrimonyTypeByIdUseCase,
  UpdatePatrimonyTypeUseCase,
} from './use-cases';
import { PatrimonyTypeController } from './patrimony-type.controller';

@Module({
  imports: [],
  controllers: [PatrimonyTypeController],
  providers: [
    FindAllPatrimonyTypesUseCase,
    FindPatrimonyTypeByIdUseCase,
    CreatePatrimonyTypeUseCase,
    UpdatePatrimonyTypeUseCase,
    DeletePatrimonyTypeUseCase,
    PatrimonyTypeRepository,
    {
      provide: 'PatrimonyTypeRepository',
      useExisting: PatrimonyTypeRepository,
    },
  ],
  exports: [
    PatrimonyTypeRepository,
    FindPatrimonyTypeByIdUseCase,
    {
      provide: 'PatrimonyTypeRepository',
      useExisting: PatrimonyTypeRepository,
    },
  ],
})
export class PatrimonyTypeModule {}
