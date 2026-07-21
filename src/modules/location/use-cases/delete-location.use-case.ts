import { Inject, Injectable } from '@nestjs/common';
import { LocationRepository } from '../repository';
import { FindLocationByIdUseCase } from './find-location-by-id.use-case';

@Injectable()
export class DeleteLocationUseCase {
  constructor(
    @Inject('LocationRepository')
    private readonly locationRepository: LocationRepository,
    private readonly findLocationByIdUseCase: FindLocationByIdUseCase,
  ) {}

  async execute(id: string) {
    await this.findLocationByIdUseCase.execute(id);
    await this.locationRepository.delete(id);
  }
}
