import { Inject, Injectable } from '@nestjs/common';
import { CreateLocationTypeDTO } from '../dto';
import { LocationTypeRepository } from '../repository';

@Injectable()
export class CreateLocationTypeUseCase {
  constructor(
    @Inject('LocationTypeRepository')
    private readonly locationTypeRepository: LocationTypeRepository,
  ) {}

  async execute(dto: CreateLocationTypeDTO) {
    await this.locationTypeRepository.create(dto);
  }
}
