import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/adapters/pug.adapter';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { MailService } from './mail.service';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get<string>('SMTP_HOST'),
          port: config.get<number>('SMTP_PORT') ?? 587,
          secure: true,
          name:
            config.get<string>('SMTP_EHLO_NAME') ??
            config.get<string>('SMTP_HOST'),
          auth: {
            user: config.get<string>('SMTP_USER'),
            pass: config.get<string>('SMTP_PASS'),
          },
          // requireTLS: true,
          tls: {
            servername: config.get<string>('SMTP_HOST'),
          },
        },
        defaults: {
          from: `"${config.get('SMTP_FROM_NAME') ?? 'No Reply'}" <${config.get('SMTP_FROM_EMAIL') ?? config.get('SMTP_USER')}>`,
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new PugAdapter(),
          options: { strict: true },
        },
      }),
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
