import { LoggerService } from '@infrastructure/log';
import { PrismaService } from '@infrastructure/prisma';
import { Injectable } from '@nestjs/common';
import { CreateServiceOrderDTO } from '../dto';
import { generateId } from '@common/utils';
import { Prisma } from '@prisma/client';
import { BadRequestException, NotFoundException } from '@common/filters';
import { ServiceOrder } from '../entities';

@Injectable()
export class ServiceOrderRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async findAll(): Promise<ServiceOrder[]> {
    try {
      return await this.prisma.serviceOrder.findMany({
        select: {
          id: true,
          orderId: true,
          subject: true,
          description: true,
          type: true,
          department: true,
          priority: true,
          attachment: true,
          createdAt: true,
          requester: {
            select: {
              id: true,
              name: true,
            },
          },
          serviceOrderStatus: {
            select: {
              id: true,
              status: true,
              serviceOrderId: true,
              note: true,
              createdAt: true,
              technician: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
          },
        },
      });
    } catch (error) {
      void this.logger.error('ServiceOrderRepository.findAll falhou', {
        error: String(error),
      });
      throw new BadRequestException(
        'Erro ao buscar ordens de serviço: ' + error.message,
      );
    }
  }

  async findById(id: string): Promise<ServiceOrder> {
    try {
      return await this.prisma.serviceOrder.findUnique({
        where: { id },
        select: {
          id: true,
          orderId: true,
          subject: true,
          description: true,
          type: true,
          department: true,
          priority: true,
          attachment: true,
          createdAt: true,
          requester: {
            select: {
              id: true,
              name: true,
            },
          },
          serviceOrderStatus: {
            select: {
              id: true,
              status: true,
              serviceOrderId: true,
              note: true,
              createdAt: true,
              technician: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });
    } catch (error) {
      void this.logger.error('ServiceOrderRepository.findById falhou', {
        id,
        error: String(error),
      });
      throw new BadRequestException(
        'Erro ao buscar ordem de serviço: ' + error.message,
      );
    }
  }

  async create(
    dto: CreateServiceOrderDTO & {
      attachment?: string;
    },
    userId: string,
  ): Promise<void> {
    try {
      const countOS = await this.prisma.serviceOrder.count();

      const year = new Date().getFullYear();
      const paddedNumber = String(countOS + 1).padStart(3, '0');
      const orderId = `OS-${year}-${paddedNumber}`;

      await this.prisma.$transaction(async (tx) => {
        const serviceOrder = await tx.serviceOrder.create({
          data: {
            id: generateId(),
            orderId,
            subject: dto.subject,
            description: dto.description,
            type: dto.type,
            department: dto.department,
            requester: {
              connect: {
                id: userId,
              },
            },
            priority: dto.priority,
            attachment: dto.attachment,
            createdAt: new Date(),
          },
        });

        await tx.serviceOrderStatus.create({
          data: {
            id: generateId(),
            serviceOrderId: serviceOrder.id,
            status: 'OPEN',
          },
        });
      });
      void this.logger.info('Ordem de serviço criada', {
        orderId,
        userId,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        void this.logger.warn('ServiceOrderRepository.create: usuário não encontrado', {
          userId,
        });
        throw new NotFoundException(userId + ' usuário não encontrado.');
      }
      void this.logger.error('ServiceOrderRepository.create falhou', {
        userId,
        error: String(error),
      });
      throw new BadRequestException(
        'Erro ao criar status da ordem de serviço: ' + error.message,
      );
    }
  }
}
