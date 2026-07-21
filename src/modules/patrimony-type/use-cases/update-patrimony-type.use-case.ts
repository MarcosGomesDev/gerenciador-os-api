import { Inject, Injectable } from '@nestjs/common';
import { UpdatePatrimonyTypeDTO } from '../dto';
import { PatrimonyTypeRepository } from '../repository';
import { FindPatrimonyTypeByIdUseCase } from './find-patrimony-type-by-id.use-case';

@Injectable()
export class UpdatePatrimonyTypeUseCase {
  constructor(
    @Inject('PatrimonyTypeRepository')
    private readonly patrimonyTypeRepository: PatrimonyTypeRepository,
    private readonly findPatrimonyTypeByIdUseCase: FindPatrimonyTypeByIdUseCase,
  ) {}

  async execute(id: string, dto: UpdatePatrimonyTypeDTO) {
    await this.findPatrimonyTypeByIdUseCase.execute(id);
    await this.patrimonyTypeRepository.update(id, dto);
  }
}
