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
  CreateLocationTypeDTO,
  FindAllLocationTypesFilters,
  UpdateLocationTypeDTO,
} from '../dto';
import { ListLocationType, LocationType } from '../entities';

@Injectable()
export class LocationTypeRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  private buildWhere(
    filters: Omit<FindAllLocationTypesFilters, 'page' | 'limit'> = {},
  ) {
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

  async findAll(filters: FindAllLocationTypesFilters = {}): Promise<{
    data: ListLocationType[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const { page = 1, limit = 25, searchTerm } = filters;
      const skip = (page - 1) * limit;
      const where = this.buildWhere({ searchTerm });

      const [data, total] = await Promise.all([
        this.prisma.locationType.findMany({
          where,
          select: { id: true, name: true },
          skip,
          take: limit,
          orderBy: { name: 'asc' },
        }),
        this.prisma.locationType.count({ where }),
      ]);

      return {
        data: data.map((item) => new ListLocationType(item.id, item.name)),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      void this.logger.error('LocationTypeRepository.findAll falhou', {
        error: String(error),
      });
      throw new BadRequestException(
        'Erro ao buscar tipos de local: ' + error.message,
      );
    }
  }

  async findById(id: string): Promise<LocationType | null> {
    try {
      const item = await this.prisma.locationType.findUnique({
        where: { id },
        select: { id: true, name: true },
      });

      if (!item) {
        return null;
      }

      return new LocationType(item.id, item.name);
    } catch (error) {
      void this.logger.error('LocationTypeRepository.findById falhou', {
        id,
        error: String(error),
      });
      throw new BadRequestException(
        'Erro ao buscar tipo de local: ' + error.message,
      );
    }
  }

  async create(dto: CreateLocationTypeDTO): Promise<void> {
    try {
      await this.prisma.locationType.create({
        data: {
          id: generateId(),
          name: dto.name,
        },
      });
    } catch (error) {
      void this.logger.error('LocationTypeRepository.create falhou', {
        error: String(error),
      });
      throw new BadRequestException(
        'Erro ao criar tipo de local: ' + error.message,
      );
    }
  }

  async update(id: string, dto: UpdateLocationTypeDTO): Promise<void> {
    try {
      await this.prisma.locationType.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Tipo de local não encontrado.');
      }
      void this.logger.error('LocationTypeRepository.update falhou', {
        id,
        error: String(error),
      });
      throw new BadRequestException(
        'Erro ao atualizar tipo de local: ' + error.message,
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const linkedLocations = await this.prisma.location.count({
        where: { locationTypeId: id },
      });

      if (linkedLocations > 0) {
        throw new ConflictException(
          'Tipo de local possui locais vinculados.',
        );
      }

      await this.prisma.locationType.delete({ where: { id } });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Tipo de local não encontrado.');
      }
      void this.logger.error('LocationTypeRepository.delete falhou', {
        id,
        error: String(error),
      });
      throw new BadRequestException(
        'Erro ao excluir tipo de local: ' + error.message,
      );
    }
  }
}
