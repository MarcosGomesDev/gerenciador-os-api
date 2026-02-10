import { Module } from '@nestjs/common';
import { UserRepository } from './repository';
import {
  FindAllUsersUseCase,
  FindUserByIdUseCase,
  FindUserByEmailUseCase,
  FindUserByTaxIdentifierUseCase,
  CreateUserUseCase,
  UpdateUserUseCase,
  DeleteUserUseCase,
  FindUserRoleUseCase,
} from './use-cases';
import { UserController } from './user.controller';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [
    FindAllUsersUseCase,
    FindUserByIdUseCase,
    FindUserByEmailUseCase,
    FindUserRoleUseCase,
    FindUserByTaxIdentifierUseCase,
    CreateUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    UserRepository,
    {
      provide: 'UserRepository',
      useExisting: UserRepository,
    },
  ],
  exports: [
    FindUserByIdUseCase,
    FindUserByEmailUseCase,
    FindUserByTaxIdentifierUseCase,
    CreateUserUseCase,
    UpdateUserUseCase,
    UserRepository,
    {
      provide: 'UserRepository',
      useExisting: UserRepository,
    },
  ],
})
export class UserModule {}
