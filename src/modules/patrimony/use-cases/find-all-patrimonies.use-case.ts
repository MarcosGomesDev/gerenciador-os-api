import { Inject, Injectable } from '@nestjs/common';
import { FindAllPatrimoniesFilters } from '../dto';
import { PatrimonyRepository } from '../repository';

@Injectable()
export class FindAllPatrimoniesUseCase {
  constructor(
    @Inject('PatrimonyRepository')
    private readonly patrimonyRepository: PatrimonyRepository,
  ) {}

  async execute(filters: FindAllPatrimoniesFilters = {}) {
    return await this.patrimonyRepository.findAll(filters);
  }
}
