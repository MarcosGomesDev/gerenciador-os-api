import { BadRequestException } from '@common/filters';
import { Inject, Injectable } from '@nestjs/common';
import { UpdateUserStatusDTO } from '../dto';
import { UserRepository } from '../repository';
import { FindUserByIdUseCase } from './find-user-by-id.use-case';

@Injectable()
export class UpdateUserStatusUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
  ) {}

  async execute(id: string, data: UpdateUserStatusDTO, userId: string) {
    const user = await this.findUserByIdUseCase.execute(id);

    if (user.isActive === data.isActive) {
      throw new BadRequestException(
        data.isActive
          ? 'O usuário já está ativo'
          : 'O usuário já está inativo',
      );
    }

    return this.userRepository.update(id, { isActive: data.isActive }, userId);
  }
}
