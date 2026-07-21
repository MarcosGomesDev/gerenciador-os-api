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
import { Department } from 'types/department';
import { PatrimonySituation } from 'types/patrimony';
import {
  CreatePatrimonyDTO,
  FindAllPatrimoniesFilters,
  UpdatePatrimonyDTO,
} from '../dto';
import {
  ListPatrimony,
  Patrimony,
  PatrimonyLocationSummary,
  PatrimonyTypeSummary,
  PatrimonyUserSummary,
} from '../entities';

const listSelect = {
  id: true,
  inventoryNumber: true,
  description: true,
  situation: true,
  department: true,
  locationName: true,
  locationId: true,
  patrimonyTypeId: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class PatrimonyRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  private buildWhere(
    filters: Omit<FindAllPatrimoniesFilters, 'page' | 'limit'> = {},
  ) {
    const {
      searchTerm,
      department,
      locationId,
      patrimonyTypeId,
      situation,
    } = filters;

    return {
      isDeleted: false,
      ...(department && { department: department as Department }),
      ...(locationId && { locationId }),
      ...(patrimonyTypeId && { patrimonyTypeId }),
      ...(situation && { situation }),
      ...(searchTerm && {
        OR: [
          {
            inventoryNumber: {
              contains: searchTerm,
              mode: 'insensitive' as const,
            },
          },
          {
            description: {
              contains: searchTerm,
              mode: 'insensitive' as const,
            },
          },
        ],
      }),
    };
  }

  private mapToListPatrimony(
    item: Prisma.PatrimonyGetPayload<{ select: typeof listSelect }>,
  ) {
    return new ListPatrimony(
      item.id,
      item.inventoryNumber,
      item.description,
      item.situation as PatrimonySituation,
      item.department,
      item.locationName ?? undefined,
      item.locationId,
      item.patrimonyTypeId,
      item.createdAt,
      item.updatedAt,
    );
  }

  private async resolveLocationContext(locationId: string) {
    const location = await this.prisma.location.findUnique({
      where: { id: locationId },
      select: { id: true, name: true, department: true },
    });

    if (!location) {
      throw new NotFoundException('Local não encontrado.');
    }

    return location;
  }

  private async ensureUniqueInventoryNumber(
    inventoryNumber: string,
    excludeId?: string,
  ) {
    const existing = await this.prisma.patrimony.findFirst({
      where: {
        inventoryNumber,
        isDeleted: false,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
      select: { id: true },
    });

    if (existing) {
      throw new BadRequestException('Número de tombo já cadastrado.');
    }
  }

  async findAll(filters: FindAllPatrimoniesFilters = {}): Promise<{
    data: ListPatrimony[];
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
        locationId,
        patrimonyTypeId,
        situation,
      } = filters;
      const skip = (page - 1) * limit;
      const where = this.buildWhere({
        searchTerm,
        department,
        locationId,
        patrimonyTypeId,
        situation,
      });

      const [data, total] = await Promise.all([
        this.prisma.patrimony.findMany({
          where,
          select: listSelect,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.patrimony.count({ where }),
      ]);

      return {
        data: data.map((item) => this.mapToListPatrimony(item)),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      void this.logger.error('PatrimonyRepository.findAll falhou', {
        error: String(error),
      });
      throw new BadRequestException(
        'Erro ao buscar patrimônios: ' + error.message,
      );
    }
  }

  async findById(id: string): Promise<Patrimony | null> {
    try {
      const item = await this.prisma.patrimony.findFirst({
        where: { id, isDeleted: false },
        select: {
          ...listSelect,
          location: {
            select: { id: true, name: true, department: true },
          },
          patrimonyType: {
            select: { id: true, name: true },
          },
          createdBy: {
            select: { id: true, name: true },
          },
          updatedBy: {
            select: { id: true, name: true },
          },
        },
      });

      if (!item) {
        return null;
      }

      return new Patrimony(
        item.id,
        item.inventoryNumber,
        item.description,
        item.situation as PatrimonySituation,
        item.department,
        item.locationId,
        item.patrimonyTypeId,
        item.createdAt,
        item.updatedAt,
        item.locationName ?? undefined,
        item.location
          ? new PatrimonyLocationSummary(
              item.location.id,
              item.location.name,
              item.location.department,
            )
          : undefined,
        item.patrimonyType
          ? new PatrimonyTypeSummary(
              item.patrimonyType.id,
              item.patrimonyType.name,
            )
          : undefined,
        item.createdBy
          ? new PatrimonyUserSummary(item.createdBy.id, item.createdBy.name)
          : undefined,
        item.updatedBy
          ? new PatrimonyUserSummary(item.updatedBy.id, item.updatedBy.name)
          : undefined,
      );
    } catch (error) {
      void this.logger.error('PatrimonyRepository.findById falhou', {
        id,
        error: String(error),
      });
      throw new BadRequestException(
        'Erro ao buscar patrimônio: ' + error.message,
      );
    }
  }

  async create(dto: CreatePatrimonyDTO, userId: string): Promise<void> {
    try {
      await this.ensureUniqueInventoryNumber(dto.inventoryNumber);
      const location = await this.resolveLocationContext(dto.locationId);

      await this.prisma.patrimony.create({
        data: {
          id: generateId(),
          inventoryNumber: dto.inventoryNumber,
          description: dto.description,
          situation: dto.situation,
          department: location.department,
          locationName: dto.locationName ?? location.name,
          location: { connect: { id: dto.locationId } },
          patrimonyType: { connect: { id: dto.patrimonyTypeId } },
          createdBy: { connect: { id: userId } },
          updatedBy: { connect: { id: userId } },
        },
      });
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new NotFoundException('Tipo de patrimônio não encontrado.');
      }
      void this.logger.error('PatrimonyRepository.create falhou', {
        error: String(error),
      });
      throw new BadRequestException(
        'Erro ao criar patrimônio: ' + error.message,
      );
    }
  }

  async update(
    id: string,
    dto: UpdatePatrimonyDTO,
    userId: string,
  ): Promise<void> {
    try {
      if (dto.inventoryNumber) {
        await this.ensureUniqueInventoryNumber(dto.inventoryNumber, id);
      }

      let department: Department | undefined;
      let locationName: string | undefined;

      if (dto.locationId) {
        const location = await this.resolveLocationContext(dto.locationId);
        department = location.department;
        if (dto.locationName === undefined) {
          locationName = location.name;
        }
      }

      await this.prisma.patrimony.update({
        where: { id },
        data: {
          ...(dto.inventoryNumber !== undefined && {
            inventoryNumber: dto.inventoryNumber,
          }),
          ...(dto.description !== undefined && { description: dto.description }),
          ...(dto.situation !== undefined && { situation: dto.situation }),
          ...(department !== undefined && { department }),
          ...(dto.locationName !== undefined
            ? { locationName: dto.locationName }
            : locationName !== undefined
              ? { locationName }
              : {}),
          ...(dto.locationId && {
            location: { connect: { id: dto.locationId } },
          }),
          ...(dto.patrimonyTypeId && {
            patrimonyType: { connect: { id: dto.patrimonyTypeId } },
          }),
          updatedBy: { connect: { id: userId } },
        },
      });
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Patrimônio não encontrado.');
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new NotFoundException('Referência de patrimônio inválida.');
      }
      void this.logger.error('PatrimonyRepository.update falhou', {
        id,
        error: String(error),
      });
      throw new BadRequestException(
        'Erro ao atualizar patrimônio: ' + error.message,
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const linkedServiceOrders = await this.prisma.serviceOrder.count({
        where: { patrimonyId: id },
      });

      if (linkedServiceOrders > 0) {
        throw new ConflictException(
          'Patrimônio possui ordens de serviço vinculadas.',
        );
      }

      await this.prisma.patrimony.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Patrimônio não encontrado.');
      }
      void this.logger.error('PatrimonyRepository.delete falhou', {
        id,
        error: String(error),
      });
      throw new BadRequestException(
        'Erro ao excluir patrimônio: ' + error.message,
      );
    }
  }
}
