import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@common/filters';
import { generateId } from '@common/utils';
import { LoggerService } from '@infrastructure/log';
import { PrismaService } from '@infrastructure/prisma';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  CreatePatrimonyTypeDTO,
  FindAllPatrimonyTypesFilters,
  UpdatePatrimonyTypeDTO,
} from '../dto';
import { ListPatrimonyType, PatrimonyType } from '../entities';

@Injectable()
export class PatrimonyTypeRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  private buildWhere(filters: Omit<FindAllPatrimonyTypesFilters, 'page' | 'limit'> = {}) {
    const { searchTerm } = filters;

    return {
      ...(searchTerm && {
        name: {
          contains: searchTerm,
          mode: 'insensitive' as const,
        },
      }),
    };
  }

  async findAll(filters: FindAllPatrimonyTypesFilters = {}): Promise<{
    data: ListPatrimonyType[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const { page = 1, limit = 25, searchTerm } = filters;
      const skip = (page - 1) * limit;
      const where = this.buildWhere({ searchTerm });

      const [data, total] = await Promise.all([
        this.prisma.patrimonyType.findMany({
          where,
          select: { id: true, name: true },
          skip,
          take: limit,
          orderBy: { name: 'asc' },
        }),
        this.prisma.patrimonyType.count({ where }),
      ]);

      return {
        data: data.map((item) => new ListPatrimonyType(item.id, item.name)),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      void this.logger.error('PatrimonyTypeRepository.findAll falhou', {
        error: String(error),
      });
      throw new BadRequestException(
        'Erro ao buscar tipos de patrimônio: ' + error.message,
      );
    }
  }

  async findById(id: string): Promise<PatrimonyType | null> {
    try {
      const item = await this.prisma.patrimonyType.findUnique({
        where: { id },
        select: { id: true, name: true },
      });

      if (!item) {
        return null;
      }

      return new PatrimonyType(item.id, item.name);
    } catch (error) {
      void this.logger.error('PatrimonyTypeRepository.findById falhou', {
        id,
        error: String(error),
      });
      throw new BadRequestException(
        'Erro ao buscar tipo de patrimônio: ' + error.message,
      );
    }
  }

  async create(dto: CreatePatrimonyTypeDTO): Promise<void> {
    try {
      await this.prisma.patrimonyType.create({
        data: {
          id: generateId(),
          name: dto.name,
        },
      });
    } catch (error) {
      void this.logger.error('PatrimonyTypeRepository.create falhou', {
        error: String(error),
      });
      throw new BadRequestException(
        'Erro ao criar tipo de patrimônio: ' + error.message,
      );
    }
  }

  async update(id: string, dto: UpdatePatrimonyTypeDTO): Promise<void> {
    try {
      await this.prisma.patrimonyType.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Tipo de patrimônio não encontrado.');
      }
      void this.logger.error('PatrimonyTypeRepository.update falhou', {
        id,
        error: String(error),
      });
      throw new BadRequestException(
        'Erro ao atualizar tipo de patrimônio: ' + error.message,
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const linkedPatrimonies = await this.prisma.patrimony.count({
        where: { patrimonyTypeId: id, isDeleted: false },
      });

      if (linkedPatrimonies > 0) {
        throw new ConflictException(
          'Tipo de patrimônio possui patrimônios vinculados.',
        );
      }

      await this.prisma.patrimonyType.delete({ where: { id } });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Tipo de patrimônio não encontrado.');
      }
      void this.logger.error('PatrimonyTypeRepository.delete falhou', {
        id,
        error: String(error),
      });
      throw new BadRequestException(
        'Erro ao excluir tipo de patrimônio: ' + error.message,
      );
    }
  }
}
