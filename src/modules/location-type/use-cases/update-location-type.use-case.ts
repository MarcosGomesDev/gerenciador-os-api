import { Inject, Injectable } from '@nestjs/common';
import { UpdateLocationTypeDTO } from '../dto';
import { LocationTypeRepository } from '../repository';
import { FindLocationTypeByIdUseCase } from './find-location-type-by-id.use-case';

@Injectable()
export class UpdateLocationTypeUseCase {
  constructor(
    @Inject('LocationTypeRepository')
    private readonly locationTypeRepository: LocationTypeRepository,
    private readonly findLocationTypeByIdUseCase: FindLocationTypeByIdUseCase,
  ) {}

  async execute(id: string, dto: UpdateLocationTypeDTO) {
    await this.findLocationTypeByIdUseCase.execute(id);
    await this.locationTypeRepository.update(id, dto);
  }
}
