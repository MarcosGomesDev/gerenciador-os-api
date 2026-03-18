import { BadRequestException } from '@common/filters';
import { LoggerService } from '@infrastructure/log';
import { PrismaService } from '@infrastructure/prisma';
import { Injectable } from '@nestjs/common';
import { FindAllHistoricFilters } from '../dto';
import { ListHistoric } from '../entities';

@Injectable()
export class HistoricRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  private buildWhere(filters: FindAllHistoricFilters = {}) {
    const { searchTerm, action } = filters;
    return {
      ...(action && { action }),
      ...(searchTerm && {
        OR: [
          {
            order: {
              orderId: {
                contains: searchTerm,
                mode: 'insensitive' as const,
              },
            },
          },
          {
            user: {
              name: {
                contains: searchTerm,
                mode: 'insensitive' as const,
              },
            },
          },
        ],
      }),
    };
  }

  private readonly select = {
    id: true,
    action: true,
    detail: true,
    createdAt: true,
    order: {
      select: { orderId: true },
    },
    user: {
      select: { name: true },
    },
  } as const;

  async findAll(filters: FindAllHistoricFilters = {}): Promise<{
    data: ListHistoric[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const { page = 1, limit = 25, searchTerm, action } = filters;

      const skip = (page - 1) * limit;

      const where = this.buildWhere({ searchTerm, action });

      const [data, total] = await Promise.all([
        this.prisma.historic.findMany({
          where,
          select: this.select,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.historic.count({ where }),
      ]);

      return {
        data: data.map(
          (item) =>
            new ListHistoric(
              item.id,
              item.action,
              item.order.orderId,
              item.detail,
              item.createdAt,
              item.user?.name,
            ),
        ),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      void this.logger.error('HistoricRepository.findAll falhou', {
        error: String(error),
      });
      throw new BadRequestException(
        'Erro ao buscar históricos: ' + error.message,
      );
    }
  }

  async count(filters: Omit<FindAllHistoricFilters, 'page' | 'limit'> = {}) {
    const where = this.buildWhere(filters);
    return await this.prisma.historic.count({ where });
  }

  async findManyForExport(params: {
    filters: Omit<FindAllHistoricFilters, 'page' | 'limit'>;
    skip: number;
    take: number;
  }): Promise<ListHistoric[]> {
    try {
      const { filters, skip, take } = params;
      const where = this.buildWhere(filters);

      const data = await this.prisma.historic.findMany({
        where,
        select: this.select,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      });

      return data.map(
        (item) =>
          new ListHistoric(
            item.id,
            item.action,
            item.order.orderId,
            item.detail,
            item.createdAt,
            item.user?.name,
          ),
      );
    } catch (error) {
      void this.logger.error('HistoricRepository.findManyForExport falhou', {
        error: String(error),
      });
      throw new BadRequestException(
        'Erro ao buscar históricos para exportação: ' + error.message,
      );
    }
  }
}
