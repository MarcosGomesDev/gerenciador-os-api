import { CreateTokenPasswordUseCase } from '@modules/token-password';
import { FindUserByTaxIdentifierUseCase } from '@modules/user';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    private readonly findUserByTaxIdentifierUseCase: FindUserByTaxIdentifierUseCase,
    private readonly createTokenPasswordUseCase: CreateTokenPasswordUseCase,
  ) {}

  async execute(taxIdentifier: string) {
    // Proteção contra Enumeration Attack:
    // Sempre retornar sucesso, mesmo se email não existir
    // Não revelar se o email está cadastrado no sistema
    const user = await this.findUserByTaxIdentifierUseCase
      .execute(taxIdentifier)
      .catch(() => null);

    // Só criar token e enviar email se o usuário existir
    if (user) {
      await this.createTokenPasswordUseCase.execute(user.email);
    }
  }
}
