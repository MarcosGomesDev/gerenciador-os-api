import { Inject, Injectable } from '@nestjs/common';
import { UpdateLocationDTO } from '../dto';
import { LocationRepository } from '../repository';
import { FindLocationByIdUseCase } from './find-location-by-id.use-case';

@Injectable()
export class UpdateLocationUseCase {
  constructor(
    @Inject('LocationRepository')
    private readonly locationRepository: LocationRepository,
    private readonly findLocationByIdUseCase: FindLocationByIdUseCase,
  ) {}

  async execute(id: string, dto: UpdateLocationDTO) {
    await this.findLocationByIdUseCase.execute(id);
    await this.locationRepository.update(id, dto);
  }
}
