import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthGuard, RolesGuard } from './common/guards';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { RequestIdInterceptor } from './common/interceptors';
import { PrismaModule } from '@infrastructure/prisma';
import { MetricsInterceptor, MetricsModule } from '@infrastructure/metrics';
import { ThrottlerConfigModule } from '@infrastructure/throttler';
import { CacheModule } from '@infrastructure/cache';
import { SecurityModule } from '@infrastructure/security';
import { CryptographyModule } from '@infrastructure/criptography';
import { CircuitBreakerModule } from '@infrastructure/circuit-breaker';
import { ConfigModule } from '@infrastructure/config';
import { HealthModule } from '@infrastructure/health';
import { JwtModule } from '@infrastructure/jwt';
import { UserModule } from '@modules/user';
import { AuthModule } from '@modules/auth';

@Module({
  imports: [
    ConfigModule,
    CacheModule,
    CircuitBreakerModule,
    MetricsModule,
    CryptographyModule,
    PrismaModule,
    SecurityModule,
    ThrottlerConfigModule,
    HealthModule,
    JwtModule,
    AuthModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AuthGuard,
    RolesGuard,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestIdInterceptor,
    },
  ],
})
export class AppModule {}
