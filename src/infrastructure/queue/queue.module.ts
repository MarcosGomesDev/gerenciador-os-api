import { BullModule } from '@nestjs/bull';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const host = config.get<string>('REDIS_HOST') ?? '127.0.0.1';
        const port = Number(config.get<number | string>('REDIS_PORT') ?? 6379);
        const password = config.get<string>('REDIS_PASSWORD') ?? undefined;
        const tlsEnabled = String(config.get('REDIS_TLS') ?? '').toLowerCase();

        return {
          redis: {
            host,
            port,
            password,
            ...(tlsEnabled === 'true' ? { tls: {} } : {}),
          },
          defaultJobOptions: {
            attempts: 3,
            backoff: { type: 'exponential', delay: 5_000 },
            removeOnComplete: { age: 60 * 60, count: 1000 },
            removeOnFail: { age: 24 * 60 * 60, count: 10_000 },
          },
        };
      },
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
