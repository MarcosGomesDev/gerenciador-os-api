import { MailService } from '@infrastructure/providers';
import { CreateUserDTO, CreateUserUseCase } from '@modules/user';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SignUpUseCase {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly mailService: MailService,
  ) {}

  async execute(dto: CreateUserDTO, userId: string) {
    const newUser = await this.createUserUseCase.execute(dto, userId);

    if (process.env.NODE_ENV === 'prod') {
      const frontendUrl = process.env.FRONTEND_URL?.replace(/\/$/, '') ?? '';
      await this.mailService.sendMail({
        to: newUser.email,
        subject: 'Bem-vindo ao sistema',
        template: 'welcome',
        context: { name: newUser.name, frontendUrl },
      });
    }
  }
}
