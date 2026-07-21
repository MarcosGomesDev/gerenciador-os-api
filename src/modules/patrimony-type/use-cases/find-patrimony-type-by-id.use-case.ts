import { NotFoundException } from '@common/filters';
import { Inject, Injectable } from '@nestjs/common';
import { PatrimonyTypeRepository } from '../repository';

@Injectable()
export class FindPatrimonyTypeByIdUseCase {
  constructor(
    @Inject('PatrimonyTypeRepository')
    private readonly patrimonyTypeRepository: PatrimonyTypeRepository,
  ) {}

  async execute(id: string) {
    const item = await this.patrimonyTypeRepository.findById(id);

    if (!item) {
      throw new NotFoundException('Tipo de patrimônio não encontrado.');
    }

    return item;
  }
}
