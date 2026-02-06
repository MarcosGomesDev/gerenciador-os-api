import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../repository';

@Injectable()
export class FindAllUsersUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  async execute() {
    return this.userRepository.findAll();
  }
}
