import { Inject, Injectable } from '@nestjs/common';
import { CreatePatrimonyDTO } from '../dto';
import { PatrimonyRepository } from '../repository';

@Injectable()
export class CreatePatrimonyUseCase {
  constructor(
    @Inject('PatrimonyRepository')
    private readonly patrimonyRepository: PatrimonyRepository,
  ) {}

  async execute(dto: CreatePatrimonyDTO, userId: string) {
    await this.patrimonyRepository.create(dto, userId);
  }
}
