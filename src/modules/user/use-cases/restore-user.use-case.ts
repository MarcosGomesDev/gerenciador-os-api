import { BadRequestException, NotFoundException } from '@common/filters';
import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../repository';

@Injectable()
export class RestoreUserUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  async execute(id: string) {
    const user = await this.userRepository.findByIdIncludingDeleted(id);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (!user.isDeleted) {
      throw new BadRequestException('Este usuário não está excluído.');
    }

    return this.userRepository.restore(id);
  }
}
