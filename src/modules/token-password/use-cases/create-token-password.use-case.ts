import { generateToken } from '@common/utils';
import { CryptographyService } from '@infrastructure/criptography';
import { Inject, Injectable } from '@nestjs/common';
import { TokenPasswordRepository } from '../repository';
import { MailService } from '@infrastructure/providers';

@Injectable()
export class CreateTokenPasswordUseCase {
  constructor(
    @Inject('TokenPasswordRepository')
    private readonly tokenPasswordRepository: TokenPasswordRepository,
    private readonly cryptographyService: CryptographyService,
    private readonly mailService: MailService,
  ) {}

  async execute(email: string): Promise<void> {
    const generatedToken = generateToken();

    const encriptToken = await this.cryptographyService.hash(generatedToken);
    await this.tokenPasswordRepository.createToken({
      email: email,
      token: encriptToken,
    });

    // Enviar email
    await this.mailService.sendMail({
      to: email,
      subject: 'Recuperação de senha',
      template: 'reset-password',
      context: { token: generatedToken },
    });
  }
}
