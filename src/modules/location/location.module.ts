import { Module } from '@nestjs/common';
import { LocationRepository } from './repository';
import {
  CreateLocationUseCase,
  DeleteLocationUseCase,
  FindAllLocationsUseCase,
  FindLocationByIdUseCase,
  FindLocationsForSelectUseCase,
  UpdateLocationUseCase,
} from './use-cases';
import { LocationController } from './location.controller';

@Module({
  imports: [],
  controllers: [LocationController],
  providers: [
    FindAllLocationsUseCase,
    FindLocationsForSelectUseCase,
    FindLocationByIdUseCase,
    CreateLocationUseCase,
    UpdateLocationUseCase,
    DeleteLocationUseCase,
    LocationRepository,
    {
      provide: 'LocationRepository',
      useExisting: LocationRepository,
    },
  ],
  exports: [
    LocationRepository,
    FindLocationByIdUseCase,
    {
      provide: 'LocationRepository',
      useExisting: LocationRepository,
    },
  ],
})
export class LocationModule {}
