import { Inject, Injectable } from '@nestjs/common';
import { FindAllLocationTypesFilters } from '../dto';
import { LocationTypeRepository } from '../repository';

@Injectable()
export class FindAllLocationTypesUseCase {
  constructor(
    @Inject('LocationTypeRepository')
    private readonly locationTypeRepository: LocationTypeRepository,
  ) {}

  async execute(filters: FindAllLocationTypesFilters = {}) {
    return await this.locationTypeRepository.findAll(filters);
  }
}
