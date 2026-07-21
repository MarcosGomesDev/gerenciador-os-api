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
  CreateLocationDTO,
  FindAllLocationsFilters,
  UpdateLocationDTO,
} from '../dto';
import { Department } from 'types/department';
import {
  ListLocation,
  Location,
  LocationTypeSummary,
  SelectLocation,
} from '../entities';

const listSelect = {
  id: true,
  name: true,
  department: true,
  address: true,
  directorate: true,
  phone: true,
  mobile: true,
  locationType: {
    select: { name: true },
  },
} as const;

const selectSelect = {
  id: true,
  name: true,
  address: true,
  department: true,
} as const;

@Injectable()
export class LocationRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  private buildWhere(
    filters: Omit<FindAllLocationsFilters, 'page' | 'limit'> = {},
  ) {
    const { searchTerm, department, locationTypeId } = filters;

    return {
      ...(department && { department: department }),
      ...(locationTypeId && { locationTypeId }),
      ...(searchTerm && {
        OR: [
          {
            name: {
              contains: searchTerm,
              mode: 'insensitive' as const,
            },
          },
          {
            address: {
              contains: searchTerm,
              mode: 'insensitive' as const,
            },
          },
        ],
      }),
    };
  }

  private mapToListLocation(
    item: Prisma.LocationGetPayload<{ select: typeof listSelect }>,
  ) {
    return new ListLocation(
      item.id,
      item.name,
      item.department,
      item.locationType.name,
      item.address ?? undefined,
      item.directorate ?? undefined,
      item.phone ?? undefined,
      item.mobile ?? undefined,
    );
  }

  async findForSelect(
    filters: {
      searchTerm?: string;
      department?: Department;
    } = {},
  ): Promise<SelectLocation[]> {
    try {
      const { searchTerm, department } = filters;

      const data = await this.prisma.location.findMany({
        where: {
          ...(department && { department }),
          ...(searchTerm && {
            name: {
              contains: searchTerm,
              mode: 'insensitive' as const,
            },
          }),
        },
        select: selectSelect,
        take: 20,
        orderBy: { name: 'asc' },
      });

      return data.map(
        (item) =>
          new SelectLocation(item.id, item.name, item.address, item.department),
      );
    } catch (error) {
      void this.logger.error('LocationRepository.findForSelect falhou', {
        error: String(error),
      });
      throw new BadRequestException('Erro ao buscar locais para seleção');
    }
  }

  async findAll(filters: FindAllLocationsFilters = {}): Promise<{
    data: ListLocation[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const {
        page = 1,
        limit = 25,
        searchTerm,
        department,
        locationTypeId,
      } = filters;
      const skip = (page - 1) * limit;
      const where = this.buildWhere({ searchTerm, department, locationTypeId });

      const [data, total] = await Promise.all([
        this.prisma.location.findMany({
          where,
          select: listSelect,
          skip,
          take: limit,
          orderBy: { name: 'asc' },
        }),
        this.prisma.location.count({ where }),
      ]);

      return {
        data: data.map((item) => this.mapToListLocation(item)),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      void this.logger.error('LocationRepository.findAll falhou', {
        error: String(error),
      });
      throw new BadRequestException('Erro ao buscar locais');
    }
  }

  async findById(id: string): Promise<Location | null> {
    try {
      const item = await this.prisma.location.findUnique({
        where: { id },
        select: {
          ...listSelect,
          locationTypeId: true,
          locationType: {
            select: { id: true, name: true },
          },
        },
      });

      if (!item) {
        return null;
      }

      return new Location(
        item.id,
        item.name,
        item.department,
        item.locationTypeId,
        item.address ?? undefined,
        item.directorate ?? undefined,
        item.phone ?? undefined,
        item.mobile ?? undefined,
        item.locationType
          ? new LocationTypeSummary(
              item.locationType.id,
              item.locationType.name,
            )
          : undefined,
      );
    } catch (error) {
      void this.logger.error('LocationRepository.findById falhou', {
        id,
        error: String(error),
      });
      throw new BadRequestException('Erro ao buscar local');
    }
  }

  async create(dto: CreateLocationDTO): Promise<void> {
    try {
      await this.prisma.location.create({
        data: {
          id: generateId(),
          name: dto.name,
          department: dto.department,
          address: dto.address ?? null,
          directorate: dto.directorate ?? null,
          phone: dto.phone ?? null,
          mobile: dto.mobile ?? null,
          locationType: {
            connect: { id: dto.locationTypeId },
          },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new NotFoundException('Tipo de local não encontrado.');
      }
      void this.logger.error('LocationRepository.create falhou', {
        error: String(error),
      });
      throw new BadRequestException('Erro ao criar local');
    }
  }

  async update(id: string, dto: UpdateLocationDTO): Promise<void> {
    try {
      await this.prisma.location.update({
        where: { id },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.department !== undefined && { department: dto.department }),
          ...(dto.address !== undefined && { address: dto.address }),
          ...(dto.directorate !== undefined && {
            directorate: dto.directorate,
          }),
          ...(dto.phone !== undefined && { phone: dto.phone }),
          ...(dto.mobile !== undefined && { mobile: dto.mobile }),
          ...(dto.locationTypeId && {
            locationType: { connect: { id: dto.locationTypeId } },
          }),
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Local não encontrado.');
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new NotFoundException('Tipo de local não encontrado.');
      }
      void this.logger.error('LocationRepository.update falhou', {
        id,
        error: String(error),
      });
      throw new BadRequestException('Erro ao atualizar local');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const [linkedPatrimonies, linkedUsers] = await Promise.all([
        this.prisma.patrimony.count({
          where: { locationId: id, isDeleted: false },
        }),
        this.prisma.user.count({
          where: { locationId: id, isDeleted: false },
        }),
      ]);

      if (linkedPatrimonies > 0 || linkedUsers > 0) {
        throw new ConflictException(
          'Local possui patrimônios ou usuários vinculados.',
        );
      }

      await this.prisma.location.delete({ where: { id } });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Local não encontrado.');
      }
      void this.logger.error('LocationRepository.delete falhou', {
        id,
        error: String(error),
      });
      throw new BadRequestException('Erro ao excluir local');
    }
  }
}
