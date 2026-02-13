import { BadRequestException, NotFoundException } from '@common/filters';
import { generateId } from '@common/utils';
import { LoggerService } from '@infrastructure/log';
import { PrismaService } from '@infrastructure/prisma';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateServiceOrderStatusDTO } from '../dto';

@Injectable()
export class ServiceOrderStatusRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async create(dto: CreateServiceOrderStatusDTO): Promise<void> {
    try {
      await this.prisma.serviceOrderStatus.create({
        data: {
          id: generateId(),
          status: dto.status,
          note: dto.note,
          serviceOrder: {
            connect: {
              id: dto.serviceOrderId,
            },
          },
          ...(dto.technicianId && {
            technician: {
              connect: {
                id: dto.technicianId,
              },
            },
          }),
          createdAt: new Date(),
        },
      });
      void this.logger.info('Status da ordem de serviço criado', {
        serviceOrderId: dto.serviceOrderId,
        status: dto.status,
        technicianId: dto.technicianId,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        void this.logger.warn(
          'ServiceOrderStatusRepository.create: ordem de serviço não encontrada',
          { serviceOrderId: dto.serviceOrderId },
        );
        throw new NotFoundException(
          dto.serviceOrderId + ' ordem de serviço não encontrada.',
        );
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        void this.logger.warn(
          'ServiceOrderStatusRepository.create: técnico não encontrado',
          { technicianId: dto.technicianId },
        );
        throw new NotFoundException(
          dto.technicianId + ' técnico não encontrado.',
        );
      }
      void this.logger.error('ServiceOrderStatusRepository.create falhou', {
        serviceOrderId: dto.serviceOrderId,
        error: String(error),
      });
      throw new BadRequestException(
        'Erro ao criar status da ordem de serviço: ' + error.message,
      );
    }
  }
}
