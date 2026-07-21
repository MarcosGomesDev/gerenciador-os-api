import { Inject, Injectable } from '@nestjs/common';
import { FindAllPatrimonyTypesFilters } from '../dto';
import { PatrimonyTypeRepository } from '../repository';

@Injectable()
export class FindAllPatrimonyTypesUseCase {
  constructor(
    @Inject('PatrimonyTypeRepository')
    private readonly patrimonyTypeRepository: PatrimonyTypeRepository,
  ) {}

  async execute(filters: FindAllPatrimonyTypesFilters = {}) {
    return await this.patrimonyTypeRepository.findAll(filters);
  }
}
