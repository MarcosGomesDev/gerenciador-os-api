import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/adapters/pug.adapter';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { MailService } from './mail.service';

function parseBoolean(
  value: string | boolean | undefined,
  fallback: boolean,
): boolean {
  if (value === undefined) return fallback;
  if (typeof value === 'boolean') return value;
  return value === 'true' || value === '1';
}

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const host = config.get<string>('SMTP_HOST');
        const port = Number(config.get('SMTP_PORT') ?? 465);
        const user = config.get<string>('SMTP_USER');
        const pass = config.get<string>('SMTP_PASS');
        const secure = parseBoolean(
          config.get('SMTP_SECURE'),
          port === 465,
        );
        const rejectUnauthorized = parseBoolean(
          config.get('SMTP_REJECT_UNAUTHORIZED'),
          true,
        );

        return {
          transport: {
            host,
            port,
            secure,
            name:
              config.get<string>('SMTP_EHLO_NAME') ??
              host,
            auth: user ? { user, pass } : undefined,
            tls: {
              servername: host,
              rejectUnauthorized,
            },
          },
          defaults: {
            from: `"${config.get('SMTP_FROM_NAME') ?? 'No Reply'}" <${config.get('SMTP_FROM_EMAIL') ?? user}>`,
          },
          template: {
            dir: join(__dirname, 'templates'),
            adapter: new PugAdapter(),
            options: { strict: true },
          },
        };
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
