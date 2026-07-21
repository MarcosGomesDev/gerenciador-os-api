import { Inject, Injectable } from '@nestjs/common';
import { CreatePatrimonyTypeDTO } from '../dto';
import { PatrimonyTypeRepository } from '../repository';

@Injectable()
export class CreatePatrimonyTypeUseCase {
  constructor(
    @Inject('PatrimonyTypeRepository')
    private readonly patrimonyTypeRepository: PatrimonyTypeRepository,
  ) {}

  async execute(dto: CreatePatrimonyTypeDTO) {
    await this.patrimonyTypeRepository.create(dto);
  }
}
