import { LocalStorageService } from '@infrastructure/providers';
import { Inject, Injectable } from '@nestjs/common';
import { CreateServiceOrderDTO } from '../dto';
import { ServiceOrderRepository } from '../repository';

@Injectable()
export class CreateServiceOrderUseCase {
  constructor(
    @Inject('ServiceOrderRepository')
    private readonly serviceOrderRepository: ServiceOrderRepository,
    private readonly storageService: LocalStorageService,
  ) {}

  async execute(
    dto: CreateServiceOrderDTO,
    userId: string,
    file?: Express.Multer.File,
  ): Promise<void> {
    let attachment: string | undefined;

    if (file) {
      const stored = await this.storageService.storePublicationAttachment({
        publicationId: 'service-orders', // pode melhorar isso
        file,
      });

      attachment = stored.relativePath;
    }

    await this.serviceOrderRepository.create(
      {
        ...dto,
        attachment,
      },
      userId,
    );
  }
}
