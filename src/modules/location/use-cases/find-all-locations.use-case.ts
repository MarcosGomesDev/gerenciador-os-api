import { Inject, Injectable } from '@nestjs/common';
import { FindAllLocationsFilters } from '../dto';
import { LocationRepository } from '../repository';

@Injectable()
export class FindAllLocationsUseCase {
  constructor(
    @Inject('LocationRepository')
    private readonly locationRepository: LocationRepository,
  ) {}

  async execute(filters: FindAllLocationsFilters = {}) {
    return await this.locationRepository.findAll(filters);
  }
}
