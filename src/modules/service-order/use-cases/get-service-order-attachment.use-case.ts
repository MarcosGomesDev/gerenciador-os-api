import { NotFoundException } from '@common/filters';
import { LocalStorageService } from '@infrastructure/providers';
import { Inject, Injectable } from '@nestjs/common';
import type { Readable } from 'node:stream';
import { ServiceOrderRepository } from '../repository';

export type ServiceOrderAttachmentFile = Readonly<{
  stream: Readable;
  fileName: string;
  mimeType: string;
}>;

@Injectable()
export class GetServiceOrderAttachmentUseCase {
  constructor(
    @Inject('ServiceOrderRepository')
    private readonly serviceOrderRepository: ServiceOrderRepository,
    private readonly storageService: LocalStorageService,
  ) {}

  async execute(id: string): Promise<ServiceOrderAttachmentFile> {
    const serviceOrder = await this.serviceOrderRepository.findById(id);

    if (!serviceOrder) {
      throw new NotFoundException('Ordem de serviço não encontrada');
    }

    if (!serviceOrder.attachment) {
      throw new NotFoundException('Anexo não encontrado');
    }

    const file = await this.storageService.resolve(serviceOrder.attachment);

    return {
      stream: file.createReadStream(),
      fileName: file.fileName,
      mimeType: file.mimeType,
    };
  }
}
