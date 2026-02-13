import { BadRequestException, NotFoundException } from '@common/filters';
import { generateId } from '@common/utils';
import { PrismaService } from '@infrastructure/prisma';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateServiceOrderStatusDTO } from '../dto';

@Injectable()
export class ServiceOrderStatusRepository {
  constructor(private readonly prisma: PrismaService) {}

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
    } catch (error) {
      console.error(error);
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(
          dto.serviceOrderId + ' ordem de serviço não encontrada.',
        );
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new NotFoundException(
          dto.technicianId + ' técnico não encontrado.',
        );
      }

      throw new BadRequestException(
        'Erro ao criar status da ordem de serviço: ' + error.message,
      );
    }
  }
}
