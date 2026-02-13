import { CacheModule } from '@infrastructure/cache';
import { CircuitBreakerModule } from '@infrastructure/circuit-breaker';
import { ConfigModule } from '@infrastructure/config';
import { CryptographyModule } from '@infrastructure/criptography';
import { HealthModule } from '@infrastructure/health';
import { JwtModule } from '@infrastructure/jwt';
import { MetricsInterceptor, MetricsModule } from '@infrastructure/metrics';
import { PrismaModule } from '@infrastructure/prisma';
import { MailModule, StorageModule } from '@infrastructure/providers';
import { SecurityModule } from '@infrastructure/security';
import { ThrottlerConfigModule } from '@infrastructure/throttler';
import { AuthModule } from '@modules/auth';
import { ServiceOrderModule } from '@modules/service-order';
import { ServiceOrderStatusModule } from '@modules/service-order-status';
import { TokenPasswordModule } from '@modules/token-password';
import { UserModule } from '@modules/user';
import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthGuard, RolesGuard } from './common/guards';
import { RequestIdInterceptor } from './common/interceptors';

@Module({
  imports: [
    ConfigModule,
    CacheModule,
    CircuitBreakerModule,
    MetricsModule,
    CryptographyModule,
    MailModule,
    StorageModule,
    PrismaModule,
    SecurityModule,
    ThrottlerConfigModule,
    HealthModule,
    JwtModule,
    AuthModule,
    UserModule,
    TokenPasswordModule,
    ServiceOrderModule,
    ServiceOrderStatusModule,
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
      useClass: RolesGuard,
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
