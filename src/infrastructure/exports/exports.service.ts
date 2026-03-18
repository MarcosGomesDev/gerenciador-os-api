import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { JobOptions, Queue } from 'bull';
import { EXPORTS_QUEUE } from './exports.constants';

@Injectable()
export class ExportsService {
  constructor(@InjectQueue(EXPORTS_QUEUE) private readonly queue: Queue) {}

  async enqueue<TPayload extends Record<string, any>>(
    jobName: string,
    payload: TPayload,
    opts: JobOptions = {},
  ): Promise<{ jobId: string | number | undefined }> {
    const job = await this.queue.add(jobName, payload, opts);
    return { jobId: job.id };
  }
}

