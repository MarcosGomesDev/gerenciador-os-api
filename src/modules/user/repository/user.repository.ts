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
    try {
      const technicians = await this.prisma.user.findMany({
        where: { role: 'TECHNICIAN', isDeleted: false, isActive: true },
        select: {
          id: true,
          name: true,
        },
        orderBy: {
          name: 'asc',
        },
      });

      return technicians;
    } catch (error) {
      void this.logger.error('UserRepository.findTechnicians falhou', {
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
      throw new InternalServerErrorException(error);
    }
  }

  async update(id: string, data: UpdateUserDTO) {
    try {
      await this.prisma.user.update({
        where: { id },
        data,
      });
      void this.logger.info('Usuário atualizado', { userId: id });
    } catch (error) {
      void this.logger.error('UserRepository.update falhou', {
        userId: id,
        error: String(error),
      });
      throw new InternalServerErrorException(error);
    }
  }

  async delete(id: string) {
    try {
      await this.prisma.user.update({
        where: { id },
        data: {
          isActive: false,
          isDeleted: true,
          deletedAt: new Date(),
        },
      });
      void this.logger.info('Usuário excluído (soft delete)', { userId: id });
    } catch (error) {
      void this.logger.error('UserRepository.delete falhou', {
        userId: id,
        error: String(error),
      });
      throw new InternalServerErrorException(error);
    }
  }
}
