import { BadRequestException } from '@common/filters';
import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../repository';
import { FindUserByIdUseCase } from './find-user-by-id.use-case';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly findByIdUseCase: FindUserByIdUseCase,
  ) {}

  async execute(id: string) {
    const user = await this.findByIdUseCase.execute(id);

    if (user.isActive) {
      throw new BadRequestException(
        'Não é possível excluir um usuário ativo. Desative-o antes de excluir.',
      );
    }

    return this.userRepository.delete(id);
  }
}
