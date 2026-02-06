import { CreateUserDTO, CreateUserUseCase } from '@modules/user';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SignUpUseCase {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  async execute(dto: CreateUserDTO, userId: string) {
    return await this.createUserUseCase.execute(dto, userId);
  }
}
