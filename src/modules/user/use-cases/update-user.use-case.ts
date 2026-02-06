import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../repository';
import { UpdateUserDTO } from '../dto';
import { CryptographyService } from '@infrastructure/criptography';
import { BadRequestException } from '@common/filters';
import { FindUserByIdUseCase } from './find-user-by-id.use-case';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
    private readonly cryptographyService: CryptographyService,
  ) {}

  async execute(id: string, data: UpdateUserDTO, userId: string) {
    const user = await this.findUserByIdUseCase.execute(id);

    if (data.password) {
      const isOldPassword = await this.cryptographyService.compare(
        data.password,
        user.password,
      );

      if (isOldPassword) {
        throw new BadRequestException(
          'A senha nova não pode ser igual à uma senha anterior!',
        );
      }

      data.password = await this.cryptographyService.hash(data.password);
    }

    return this.userRepository.update(id, data);
  }
}
