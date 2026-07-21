import { Inject, Injectable } from '@nestjs/common';
import { UpdatePatrimonyDTO } from '../dto';
import { PatrimonyRepository } from '../repository';
import { FindPatrimonyByIdUseCase } from './find-patrimony-by-id.use-case';

@Injectable()
export class UpdatePatrimonyUseCase {
  constructor(
    @Inject('PatrimonyRepository')
    private readonly patrimonyRepository: PatrimonyRepository,
    private readonly findPatrimonyByIdUseCase: FindPatrimonyByIdUseCase,
  ) {}

  async execute(id: string, dto: UpdatePatrimonyDTO, userId: string) {
    await this.findPatrimonyByIdUseCase.execute(id);
    await this.patrimonyRepository.update(id, dto, userId);
  }
}
