import { BullModule } from '@nestjs/bull';
import { Global, Module } from '@nestjs/common';
import { EXPORTS_QUEUE } from './exports.constants';
import { ExportsService } from './exports.service';

@Global()
@Module({
  imports: [BullModule.registerQueue({ name: EXPORTS_QUEUE })],
  providers: [ExportsService],
  exports: [ExportsService, BullModule],
})
export class ExportsModule {}

