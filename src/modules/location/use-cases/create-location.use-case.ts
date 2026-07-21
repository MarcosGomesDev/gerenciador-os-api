import { Inject, Injectable } from '@nestjs/common';
import { CreateLocationDTO } from '../dto';
import { LocationRepository } from '../repository';

@Injectable()
export class CreateLocationUseCase {
  constructor(
    @Inject('LocationRepository')
    private readonly locationRepository: LocationRepository,
  ) {}

  async execute(dto: CreateLocationDTO) {
    await this.locationRepository.create(dto);
  }
}
