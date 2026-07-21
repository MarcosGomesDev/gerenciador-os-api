import { BadRequestException, NotFoundException } from '@common/filters';
import { generateId } from '@common/utils';
import { LoggerService } from '@infrastructure/log';
import { PrismaService } from '@infrastructure/prisma';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateServiceOrderStatusDTO } from '../dto';

export type ServiceOrderLabUpdates = {
  labDescription?: string;
  labTechnicianId?: string;
};

@Injectable()
export class ServiceOrderStatusRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async create(
    dto: CreateServiceOrderStatusDTO,
    orderUpdates?: ServiceOrderLabUpdates,
  ): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {
        const currentOrder = await tx.serviceOrder.findUnique({
          where: { id: dto.serviceOrderId },
          select: {
            status: true,
            labEntryAt: true,
            labExitAt: true,
          },
        });

        if (!currentOrder) {
          throw new NotFoundException(
            dto.serviceOrderId + ' ordem de serviço não encontrada.',
          );
        }

        await tx.serviceOrderStatus.create({
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

        const serviceOrderData: Prisma.ServiceOrderUpdateInput = {
          status: dto.status,
        };

        if (orderUpdates?.labDescription !== undefined) {
          serviceOrderData.labDescription = orderUpdates.labDescription;
        }

        if (orderUpdates?.labTechnicianId) {
          serviceOrderData.labTechnician = {
            connect: { id: orderUpdates.labTechnicianId },
          };
        }

        if (dto.status === 'IN_LABORATORY' && !currentOrder.labEntryAt) {
          serviceOrderData.labEntryAt = new Date();
        }

        if (dto.status === 'LAB_COMPLETED' && !currentOrder.labExitAt) {
          serviceOrderData.labExitAt = new Date();
        } else if (
          currentOrder.status === 'IN_LABORATORY' &&
          dto.status !== 'IN_LABORATORY' &&
          !currentOrder.labExitAt
        ) {
          serviceOrderData.labExitAt = new Date();
        }

        await tx.serviceOrder.update({
          where: {
            id: dto.serviceOrderId,
          },
          data: serviceOrderData,
        });

        await tx.historic.create({
          data: {
            id: generateId(),
            action:
              dto.status === 'CLOSED'
                ? 'CLOSED'
                : dto.technicianId && !dto.note
                  ? 'ATTRIBUTED'
                  : 'UPDATE',
            orderId: dto.serviceOrderId,
            detail:
              dto.status === 'CLOSED'
                ? 'Ordem de serviço fechada'
                : dto.technicianId && !dto.note
                  ? 'Ordem de serviço atribuída'
                  : 'Ordem de serviço atualizada',
            userId: dto.technicianId,
          },
        });
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
          'ServiceOrderStatusRepository.create: referência não encontrada',
          {
            serviceOrderId: dto.serviceOrderId,
            technicianId: dto.technicianId,
            labTechnicianId: orderUpdates?.labTechnicianId,
          },
        );

        if (orderUpdates?.labTechnicianId) {
          throw new NotFoundException(
            orderUpdates.labTechnicianId + ' técnico de laboratório não encontrado.',
          );
        }

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
