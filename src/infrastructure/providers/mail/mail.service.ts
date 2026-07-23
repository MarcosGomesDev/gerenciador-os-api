import { BadRequestException } from '@common/filters';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

export type MailAttachment = Readonly<{
  filename: string;
  content?: Buffer;
  path?: string;
  contentType?: string;
  cid?: string;
}>;

const BRASAO_CANDIDATES = [
  join(process.cwd(), 'assets', 'pdf', 'logo-prefeitura.png'),
  join(process.cwd(), 'src/modules/service-order/pdf/assets', 'logo-prefeitura.png'),
  join(
    process.cwd(),
    'dist/modules/service-order/pdf/assets',
    'logo-prefeitura.png',
  ),
];

function resolveBrasaoPath(): string | null {
  for (const candidate of BRASAO_CANDIDATES) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

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
    const brasaoPath = resolveBrasaoPath();
    const hasBrasao = Boolean(brasaoPath);

    const mergedAttachments: MailAttachment[] = [...(attachments ?? [])];
    if (brasaoPath) {
      mergedAttachments.push({
        filename: 'brasao.png',
        path: brasaoPath,
        cid: 'brasao',
      });
    }

    await this.mailerService
      .sendMail({
        to,
        subject,
        template,
        context: {
          ...context,
          hasBrasao,
        },
        attachments: mergedAttachments.length ? mergedAttachments : undefined,
      })
      .catch((error) => {
        console.error(`[EMAIL] Falha ao enviar para ${to}:`, error);
        throw new BadRequestException(
          'Ocorreu um erro ao enviar o email. Tente novamente!',
        );
      });
  }
}
