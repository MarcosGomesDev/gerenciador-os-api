import { NotFoundException } from '@common/filters';
import { Inject, Injectable } from '@nestjs/common';
import { PatrimonyRepository } from '../repository';

@Injectable()
export class FindPatrimonyByIdUseCase {
  constructor(
    @Inject('PatrimonyRepository')
    private readonly patrimonyRepository: PatrimonyRepository,
  ) {}

  async execute(id: string) {
    const item = await this.patrimonyRepository.findById(id);

    if (!item) {
      throw new NotFoundException('Patrimônio não encontrado.');
    }

    return item;
  }
}
