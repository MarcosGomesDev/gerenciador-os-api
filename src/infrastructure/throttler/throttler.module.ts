import { ThrottlerModule } from '@nestjs/throttler';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        // Configuração padrão para todas as rotas
        ttl: 60000, // 1 minuto em milissegundos
        limit: 100, // 100 requisições por minuto
      },
    ]),
  ],
  exports: [ThrottlerModule],
})
export class ThrottlerConfigModule {}
