import { CacheModule } from '@infrastructure/cache';
import { CircuitBreakerModule } from '@infrastructure/circuit-breaker';
import { ConfigModule } from '@infrastructure/config';
import { CryptographyModule } from '@infrastructure/criptography';
import { HealthModule } from '@infrastructure/health';
import { JwtModule } from '@infrastructure/jwt';
import { LogModule } from '@infrastructure/log';
import { MetricsInterceptor, MetricsModule } from '@infrastructure/metrics';
import { PrismaModule } from '@infrastructure/prisma';
import { ExportsModule } from '@infrastructure/exports';
import { QueueModule } from '@infrastructure/queue/queue.module';
import { MailModule, StorageModule } from '@infrastructure/providers';
import { SecurityModule } from '@infrastructure/security';
import { ThrottlerConfigModule } from '@infrastructure/throttler';
import { AuthModule } from '@modules/auth';
import { HistoricModule } from '@modules/historic';
import { LocationModule } from '@modules/location';
import { LocationTypeModule } from '@modules/location-type';
import { PatrimonyModule } from '@modules/patrimony';
import { PatrimonyTypeModule } from '@modules/patrimony-type';
import { ReportedIssueModule } from '@modules/reported-issue';
import { ServiceOrderModule } from '@modules/service-order';
import { ServiceOrderStatusModule } from '@modules/service-order-status';
import { TokenPasswordModule } from '@modules/token-password';
import { UserModule } from '@modules/user';
import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthGuard, RolesGuard } from './common/guards';
import { HttpExceptionFilter } from './common/filters';

@Module({
  imports: [
    ConfigModule,
    LogModule,
    CacheModule,
    CircuitBreakerModule,
    MetricsModule,
    CryptographyModule,
    QueueModule,
    ExportsModule,
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
    HistoricModule,
    LocationTypeModule,
    PatrimonyTypeModule,
    LocationModule,
    PatrimonyModule,
    ReportedIssueModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AuthGuard,
    RolesGuard,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
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
  ],
})
export class AppModule {}
