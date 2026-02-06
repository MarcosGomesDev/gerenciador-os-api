import { UserModule } from '@modules/user';
import { Module } from '@nestjs/common';
import { SignInUseCase, SignUpUseCase } from './use-cases';
import { AuthController } from './auth.controller';

@Module({
  imports: [UserModule],
  controllers: [AuthController],
  providers: [SignInUseCase, SignUpUseCase],
  exports: [],
})
export class AuthModule {}
