import { Inject, Injectable } from '@nestjs/common';
import { FindUsersByRoleFilters } from '../dto';
import { UserRepository } from '../repository';

@Injectable()
export class FindUsersByRoleUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  async execute(
    filters: FindUsersByRoleFilters,
  ): Promise<{ id: string; name: string }[]> {
    return this.userRepository.findByRole(filters.role, filters.excludeUserId);
  }
}
