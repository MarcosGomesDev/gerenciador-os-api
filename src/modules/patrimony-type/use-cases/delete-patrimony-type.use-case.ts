import { Inject, Injectable } from '@nestjs/common';
import { PatrimonyTypeRepository } from '../repository';
import { FindPatrimonyTypeByIdUseCase } from './find-patrimony-type-by-id.use-case';

@Injectable()
export class DeletePatrimonyTypeUseCase {
  constructor(
    @Inject('PatrimonyTypeRepository')
    private readonly patrimonyTypeRepository: PatrimonyTypeRepository,
    private readonly findPatrimonyTypeByIdUseCase: FindPatrimonyTypeByIdUseCase,
  ) {}

  async execute(id: string) {
    await this.findPatrimonyTypeByIdUseCase.execute(id);
    await this.patrimonyTypeRepository.delete(id);
  }
}
