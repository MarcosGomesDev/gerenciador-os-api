import { Module } from '@nestjs/common';
import {
  CreateTokenPasswordUseCase,
  UpdateTokenPasswordUseCase,
  VerifyTokenPasswordUseCase,
} from './use-cases';
import { TokenPasswordRepository } from './repository';

@Module({
  imports: [],
  controllers: [],
  providers: [
    VerifyTokenPasswordUseCase,
    UpdateTokenPasswordUseCase,
    CreateTokenPasswordUseCase,
    TokenPasswordRepository,
    {
      provide: 'TokenPasswordRepository',
      useExisting: TokenPasswordRepository,
    },
  ],
  exports: [
    VerifyTokenPasswordUseCase,
    UpdateTokenPasswordUseCase,
    CreateTokenPasswordUseCase,
    TokenPasswordRepository,
    {
      provide: 'TokenPasswordRepository',
      useExisting: TokenPasswordRepository,
    },
  ],
})
export class TokenPasswordModule {}
