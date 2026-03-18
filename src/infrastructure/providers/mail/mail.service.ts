import { BadRequestException } from '@common/filters';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

export type MailAttachment = Readonly<{
  filename: string;
  content: Buffer;
  contentType?: string;
}>;

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendMail({
    to,
    subject,
    template,
    context = {},
    attachments,
  }: {
    to: string;
    subject: string;
    template: string;
    context?: Record<string, any>;
    attachments?: MailAttachment[];
  }): Promise<void> {
    await this.mailerService
      .sendMail({
        to,
        subject,
        template,
        context,
        attachments,
      })
      .catch((error) => {
        console.error('Error sending email:', error);
        throw new BadRequestException(
          'Ocorreu um erro ao enviar o email. Tente novamente!',
        );
      });
  }
}
