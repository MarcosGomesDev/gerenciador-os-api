import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
// import { MailController } from './mail.controller';
import { MailService } from './mail.service';

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
      }),
    }),
  ],
  // controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
