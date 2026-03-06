import { BadRequestException } from '@common/filters';
import { CryptographyService } from '@infrastructure/criptography';
import { Inject, Injectable } from '@nestjs/common';
import { TokenPasswordRepository } from '../repository';

@Injectable()
export class VerifyTokenPasswordUseCase {
  constructor(
    @Inject('TokenPasswordRepository')
    private readonly tokenPasswordRepository: TokenPasswordRepository,
    private readonly cryptographyService: CryptographyService,
  ) {}

  async execute(token: string) {
    const tokenPassword = await this.tokenPasswordRepository.verifyToken(token);

    if (
      !tokenPassword ||
      tokenPassword.used ||
      tokenPassword.expiresAt < new Date()
    ) {
      throw new BadRequestException('Token inválido ou expirado!');
    }

    return tokenPassword;
  }
}
