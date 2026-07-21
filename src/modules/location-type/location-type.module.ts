import { Module } from '@nestjs/common';
import { LocationTypeRepository } from './repository';
import {
  CreateLocationTypeUseCase,
  DeleteLocationTypeUseCase,
  FindAllLocationTypesUseCase,
  FindLocationTypeByIdUseCase,
  UpdateLocationTypeUseCase,
} from './use-cases';
import { LocationTypeController } from './location-type.controller';

@Module({
  imports: [],
  controllers: [LocationTypeController],
  providers: [
    FindAllLocationTypesUseCase,
    FindLocationTypeByIdUseCase,
    CreateLocationTypeUseCase,
    UpdateLocationTypeUseCase,
    DeleteLocationTypeUseCase,
    LocationTypeRepository,
    {
      provide: 'LocationTypeRepository',
      useExisting: LocationTypeRepository,
    },
  ],
  exports: [
    LocationTypeRepository,
    FindAllLocationTypesUseCase,
    FindLocationTypeByIdUseCase,
    {
      provide: 'LocationTypeRepository',
      useExisting: LocationTypeRepository,
    },
  ],
})
export class LocationTypeModule {}
