import { Inject, Injectable } from '@nestjs/common';
import { Department } from 'types/department';
import { LocationRepository } from '../repository';

@Injectable()
export class FindLocationsForSelectUseCase {
  constructor(
    @Inject('LocationRepository')
    private readonly locationRepository: LocationRepository,
  ) {}

  async execute(filters: { searchTerm?: string; department?: Department } = {}) {
    return await this.locationRepository.findForSelect(filters);
  }
}
