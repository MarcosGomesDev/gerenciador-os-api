import { UserModule } from '@modules/user';
import { Module } from '@nestjs/common';
import { MailModule } from '@infrastructure/providers';
import {
  FirstAccessUserUseCase,
  ForgotPasswordUseCase,
  LogoutUserUseCase,
  RefreshTokenUseCase,
  ResetPasswordUseCase,
  SignInUseCase,
  SignUpUseCase,
} from './use-cases';
import { AuthController } from './auth.controller';
import { TokenPasswordModule } from '@modules/token-password';

@Module({
  imports: [UserModule, TokenPasswordModule, MailModule],
  controllers: [AuthController],
  providers: [
    SignInUseCase,
    SignUpUseCase,
    LogoutUserUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    RefreshTokenUseCase,
    FirstAccessUserUseCase,
  ],
  exports: [],
})
export class AuthModule {}
