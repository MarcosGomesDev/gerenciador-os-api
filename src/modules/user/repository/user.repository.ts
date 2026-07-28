import { BadRequestException } from '@common/filters';
import { generateId } from '@common/utils';
import { LoggerService } from '@infrastructure/log';
import { PrismaService } from '@infrastructure/prisma';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDTO, FindAllUsersFilters, UpdateUserDTO } from '../dto';
import { ListUser } from '../entities';

@Injectable()
export class UserRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async findAll(filters: FindAllUsersFilters = {}): Promise<{
    data: ListUser[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const { page = 1, limit = 25, searchTerm } = filters;
      const skip = (page - 1) * limit;

      const where = {
        isDeleted: false,
        ...(searchTerm && {
          OR: [
            {
              name: {
                contains: searchTerm,
                mode: 'insensitive' as const,
              },
            },
            {
              email: {
                contains: searchTerm,
                mode: 'insensitive' as const,
              },
            },
          ],
        }),
      };

      const [data, total] = await Promise.all([
        this.prisma.user.findMany({
          where,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            department: true,
            isActive: true,
          },
          skip,
          take: limit,
          orderBy: { name: 'asc' },
        }),
        this.prisma.user.count({ where }),
      ]);

      return {
        data,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      void this.logger.error('UserRepository.findAll falhou', {
        error: String(error),
      });
      throw new InternalServerErrorException(error);
    }
  }

  async findTechnicians(): Promise<{ id: string; name: string }[]> {
    return this.findByRole('TECHNICIAN');
  }

  async findByRole(
    role: 'ADMIN' | 'TECHNICIAN',
    excludeUserId?: string,
  ): Promise<{ id: string; name: string }[]> {
    try {
      return await this.prisma.user.findMany({
        where: {
          role,
          isDeleted: false,
          isActive: true,
          ...(excludeUserId && { id: { not: excludeUserId } }),
        },
        select: {
          id: true,
          name: true,
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch (error) {
      void this.logger.error('UserRepository.findByRole falhou', {
        role,
        excludeUserId,
        error: String(error),
      });
      throw new InternalServerErrorException(error);
    }
  }

  async findById(id: string) {
    try {
      const user = await this.prisma.user.findFirst({
        where: { id, isDeleted: false },
        select: {
          id: true,
          name: true,
          email: true,
          taxIdentifier: true,
          password: true,
          role: true,
          department: true,
          isActive: true,
          isFirstAccess: true,
        },
      });

      if (!user) {
        return null;
      }

      return user;
    } catch (error) {
      void this.logger.error('UserRepository.findById falhou', {
        id,
        error: String(error),
      });
      throw new InternalServerErrorException(error);
    }
  }

  async findByEmail(email: string) {
    try {
      const user = await this.prisma.user.findFirst({
        where: { email, isDeleted: false },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          taxIdentifier: true,
          password: true,
        },
      });

      if (!user) {
        return null;
      }

      return user;
    } catch (error) {
      void this.logger.error('UserRepository.findByEmail falhou', {
        email,
        error: String(error),
      });
      throw new InternalServerErrorException(error);
    }
  }

  async findByTaxIdentifier(taxIdentifier: string) {
    try {
      const user = await this.prisma.user.findFirst({
        where: { taxIdentifier, isDeleted: false },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          taxIdentifier: true,
          password: true,
        },
      });

      if (!user) {
        return null;
      }

      return user;
    } catch (error) {
      void this.logger.error('UserRepository.findByTaxIdentifier falhou', {
        taxIdentifier,
        error: String(error),
      });
      throw new InternalServerErrorException(error);
    }
  }

  async findRoleByUserId(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId, isDeleted: false, isActive: true },
        select: { role: true },
      });

      if (!user) {
        return null;
      }

      return user.role;
    } catch (error) {
      void this.logger.error('UserRepository.findRoleByUserId falhou', {
        userId,
        error: String(error),
      });
      throw new InternalServerErrorException(error);
    }
  }

  async create(data: CreateUserDTO & { password: string }, userId: string) {
    try {
      const user = await this.prisma.user.create({
        data: {
          id: generateId(),
          ...data,
          isActive: true,
          isFirstAccess: true,
        },
      });

      void this.logger.info('Usuário criado', {
        email: user.email,
        createdBy: userId,
      });

      return user;
    } catch (error) {
      void this.logger.error('UserRepository.create falhou', {
        email: data.email,
        error: String(error),
      });
      throw new BadRequestException('Erro ao criar usuário!');
    }
  }

  async update(id: string, data: UpdateUserDTO, userId: string) {
    try {
      await this.prisma.user.update({
        where: { id },
        data: {
          ...(data.isActive !== undefined && { isActive: data.isActive }),
          ...(data.name !== undefined && { name: data.name }),
          ...(data.email !== undefined && { email: data.email }),
          ...(data.taxIdentifier !== undefined && {
            taxIdentifier: data.taxIdentifier,
          }),
          ...(data.role !== undefined && { role: data.role }),
          ...(data.department !== undefined && { department: data.department }),
          ...(data.password !== undefined && { password: data.password }),
          ...(data.isFirstAccess !== undefined && {
            isFirstAccess: data.isFirstAccess,
          }),
        },
      });
      void this.logger.info('Usuário atualizado', {
        userId: id,
        updatedBy: userId,
      });
    } catch (error) {
      void this.logger.error('UserRepository.update falhou', {
        userId: id,
        error: String(error),
      });
      throw new InternalServerErrorException(error);
    }
  }

  async delete(id: string, transferToUserId: string) {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.serviceOrder.updateMany({
          where: { userId: id },
          data: { userId: transferToUserId },
        });

        await tx.serviceOrder.updateMany({
          where: { closedById: id },
          data: { closedById: transferToUserId },
        });

        await tx.serviceOrder.updateMany({
          where: { labTechnicianId: id },
          data: { labTechnicianId: transferToUserId },
        });

        await tx.serviceOrderStatus.updateMany({
          where: { technicianId: id },
          data: { technicianId: transferToUserId },
        });

        await tx.patrimony.updateMany({
          where: { createdById: id },
          data: { createdById: transferToUserId },
        });

        await tx.patrimony.updateMany({
          where: { updatedById: id },
          data: { updatedById: transferToUserId },
        });

        await tx.user.delete({
          where: { id },
        });
      });

      void this.logger.info('Usuário excluído com reatribuição', {
        userId: id,
        transferToUserId,
      });
    } catch (error) {
      void this.logger.error('UserRepository.delete falhou', {
        userId: id,
        transferToUserId,
        error: String(error),
      });
      throw new InternalServerErrorException(error);
    }
  }
}
