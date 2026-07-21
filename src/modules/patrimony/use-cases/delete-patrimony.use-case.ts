import { Inject, Injectable } from '@nestjs/common';
import { PatrimonyRepository } from '../repository';
import { FindPatrimonyByIdUseCase } from './find-patrimony-by-id.use-case';

@Injectable()
export class DeletePatrimonyUseCase {
  constructor(
    @Inject('PatrimonyRepository')
    private readonly patrimonyRepository: PatrimonyRepository,
    private readonly findPatrimonyByIdUseCase: FindPatrimonyByIdUseCase,
  ) {}

  async execute(id: string) {
    await this.findPatrimonyByIdUseCase.execute(id);
    await this.patrimonyRepository.delete(id);
  }
}
