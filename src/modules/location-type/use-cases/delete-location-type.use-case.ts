import { Inject, Injectable } from '@nestjs/common';
import { LocationTypeRepository } from '../repository';
import { FindLocationTypeByIdUseCase } from './find-location-type-by-id.use-case';

@Injectable()
export class DeleteLocationTypeUseCase {
  constructor(
    @Inject('LocationTypeRepository')
    private readonly locationTypeRepository: LocationTypeRepository,
    private readonly findLocationTypeByIdUseCase: FindLocationTypeByIdUseCase,
  ) {}

  async execute(id: string) {
    await this.findLocationTypeByIdUseCase.execute(id);
    await this.locationTypeRepository.delete(id);
  }
}
