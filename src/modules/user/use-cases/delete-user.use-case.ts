import { BadRequestException } from '@common/filters';
import { Inject, Injectable } from '@nestjs/common';
import { DeleteUserDTO } from '../dto';
import { UserRepository } from '../repository';
import { FindUserByIdUseCase } from './find-user-by-id.use-case';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly findByIdUseCase: FindUserByIdUseCase,
  ) {}

  async execute(id: string, dto: DeleteUserDTO) {
    if (id === dto.transferToUserId) {
      throw new BadRequestException(
        'Não é possível transferir os vínculos para o mesmo usuário.',
      );
    }

    const user = await this.findByIdUseCase.execute(id);

    if (user.isActive) {
      throw new BadRequestException(
        'Não é possível excluir um usuário ativo. Desative-o antes de excluir.',
      );
    }

    const transferTo = await this.findByIdUseCase.execute(dto.transferToUserId);

    if (!transferTo.isActive) {
      throw new BadRequestException(
        'O usuário de destino precisa estar ativo.',
      );
    }

    if (transferTo.role !== user.role) {
      throw new BadRequestException(
        'O usuário de destino precisa ter o mesmo perfil do usuário excluído.',
      );
    }

    return this.userRepository.delete(id, dto.transferToUserId);
  }
}
