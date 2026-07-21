import { NotFoundException } from '@common/filters';
import { Inject, Injectable } from '@nestjs/common';
import { LocationRepository } from '../repository';

@Injectable()
export class FindLocationByIdUseCase {
  constructor(
    @Inject('LocationRepository')
    private readonly locationRepository: LocationRepository,
  ) {}

  async execute(id: string) {
    const item = await this.locationRepository.findById(id);

    if (!item) {
      throw new NotFoundException('Local não encontrado.');
    }

    return item;
  }
}
