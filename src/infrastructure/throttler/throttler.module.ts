import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 1000,
        getTracker: (req) => {
          return req.ip;
        },
      },
    ]),
  ],
  exports: [ThrottlerModule],
})
export class ThrottlerConfigModule {}
