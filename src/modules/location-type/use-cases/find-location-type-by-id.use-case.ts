import { NotFoundException } from '@common/filters';
import { Inject, Injectable } from '@nestjs/common';
import { LocationTypeRepository } from '../repository';

@Injectable()
export class FindLocationTypeByIdUseCase {
  constructor(
    @Inject('LocationTypeRepository')
    private readonly locationTypeRepository: LocationTypeRepository,
  ) {}

  async execute(id: string) {
    const item = await this.locationTypeRepository.findById(id);

    if (!item) {
      throw new NotFoundException('Tipo de local não encontrado.');
    }

    return item;
  }
}
