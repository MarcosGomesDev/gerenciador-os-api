import { BadRequestException, NotFoundException } from '@common/filters';
import { generateId } from '@common/utils';
import { LoggerService } from '@infrastructure/log';
import { PrismaService } from '@infrastructure/prisma';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Department } from 'types/department';
import { CreateServiceOrderDTO, FindAllFilters } from '../dto';
import { ServiceOrder } from '../entities';

@Injectable()
export class ServiceOrderRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async findAll(filters: FindAllFilters = {}): Promise<{
    data: ServiceOrder[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const {
        page = 1,
        limit = 10,
        department,
        priority,
        technicianName,
        status,
        searchTerm,
      } = filters;

      const skip = (page - 1) * limit;

      const where = {
        ...(department && { department: department as Department }),
        ...(priority && { priority }),
        ...(searchTerm && {
          OR: [
            {
              orderId: {
                contains: searchTerm,
                mode: 'insensitive' as const,
              },
            },
            {
              subject: {
                contains: searchTerm,
                mode: 'insensitive' as const,
              },
            },
            {
              requester: {
                contains: searchTerm,
                mode: 'insensitive' as const,
              },
            },
          ],
        }),
        ...(status || technicianName
          ? {
              serviceOrderStatus: {
                some: {
                  ...(status && { status }),
                  ...(technicianName && {
                    technician: {
                      name: {
                        contains: technicianName,
                        mode: 'insensitive' as const,
                      },
                    },
                  }),
                },
              },
            }
          : {}),
      };

      const select = {
        id: true,
        orderId: true,
        subject: true,
        description: true,
        type: true,
        department: true,
        priority: true,
        attachment: true,
        createdAt: true,
        requester: true,
        serviceOrderStatus: {
          select: {
            id: true,
            status: true,
            serviceOrderId: true,
            note: true,
            createdAt: true,
            technician: {
              select: { id: true, name: true },
            },
          },
          orderBy: { createdAt: 'desc' as const },
          take: 1,
        },
      };

      const [data, total] = await Promise.all([
        this.prisma.serviceOrder.findMany({
          where,
          select,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.serviceOrder.count({ where }),
      ]);

      return {
        data,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      void this.logger.error('ServiceOrderRepository.findAll falhou', {
        error: String(error),
      });
      throw new BadRequestException(
        'Erro ao buscar ordens de serviço: ' + error.message,
      );
    }
  }

  async findServiceOrderByUserId(
    userId: string,
    filters: FindAllFilters = {},
  ): Promise<{
    data: ServiceOrder[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 25, searchTerm } = filters;

    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...(searchTerm && {
        OR: [
          { orderId: { contains: searchTerm, mode: 'insensitive' as const } },
          { subject: { contains: searchTerm, mode: 'insensitive' as const } },
        ],
      }),
    };

    const select = {
      id: true,
      orderId: true,
      subject: true,
      description: true,
      type: true,
      department: true,
      priority: true,
      attachment: true,
      createdAt: true,
      requester: true,
      serviceOrderStatus: {
        select: {
          id: true,
          status: true,
          serviceOrderId: true,
          note: true,
          createdAt: true,
          technician: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' as const },
        take: 1,
      },
    };

    try {
      const [data, total] = await Promise.all([
        this.prisma.serviceOrder.findMany({
          where,
          select,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.serviceOrder.count({ where }),
      ]);

      return {
        data,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      void this.logger.warn(
        'ServiceOrderRepository.create: usuário não encontrado',
        {
          userId,
          error: String(error),
        },
      );
      throw new BadRequestException('Erro ao buscar ordens de serviço: ');
    }
  }

  async getDashboardSummary(): Promise<{
    totalOrders: {
      total: number;
      percentage: number;
    };
    byStatus: {
      open: number;
      inProgress: number;
      closed: { total: number; percentage: number };
    };
    avgResolutionOrders: number;
    avgResolutionTime: {
      hours: number;
      percentage: number;
    };
  }> {
    const now = new Date();

    const startCurrentPeriod = new Date(now);
    startCurrentPeriod.setDate(now.getDate() - 30);

    const startPreviousPeriod = new Date(now);
    startPreviousPeriod.setDate(now.getDate() - 60);

    const currentDateFilter = { gte: startCurrentPeriod, lte: now };
    const previousDateFilter = {
      gte: startPreviousPeriod,
      lte: startCurrentPeriod,
    };

    const [
      currentOrders,
      previousOrders,
      totalPreviousClosedOrders,
      closedOrdersWithHistory,
      previousClosedOrdersWithHistory,
    ] = await Promise.all([
      this.prisma.serviceOrder.findMany({
        where: { createdAt: currentDateFilter },
        include: {
          serviceOrderStatus: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),

      this.prisma.serviceOrder.count({
        where: { createdAt: previousDateFilter },
      }),

      this.prisma.serviceOrder.count({
        where: {
          createdAt: previousDateFilter,
          serviceOrderStatus: { some: { status: 'CLOSED' } },
        },
      }),

      // Ordens fechadas no período atual com histórico completo de status
      this.prisma.serviceOrder.findMany({
        where: {
          createdAt: currentDateFilter,
          serviceOrderStatus: { some: { status: 'CLOSED' } },
        },
        include: {
          serviceOrderStatus: {
            where: { status: { in: ['OPEN', 'CLOSED'] } },
            orderBy: { createdAt: 'asc' },
          },
        },
      }),

      // Ordens fechadas no período anterior com histórico completo de status
      this.prisma.serviceOrder.findMany({
        where: {
          createdAt: previousDateFilter,
          serviceOrderStatus: { some: { status: 'CLOSED' } },
        },
        include: {
          serviceOrderStatus: {
            where: { status: { in: ['OPEN', 'CLOSED'] } },
            orderBy: { createdAt: 'asc' },
          },
        },
      }),
    ]);

    const calcAvgResolutionInHours = (
      orders: typeof closedOrdersWithHistory,
    ) => {
      const resolutionTimes = orders
        .map((order) => {
          const openStatus = order.serviceOrderStatus.find(
            (s) => s.status === 'OPEN',
          );
          const closedStatus = order.serviceOrderStatus.find(
            (s) => s.status === 'CLOSED',
          );

          if (!openStatus || !closedStatus) return null;

          const diffMs =
            closedStatus.createdAt.getTime() - openStatus.createdAt.getTime();
          return diffMs / (1000 * 60 * 60); // converte para horas
        })
        .filter((t): t is number => t !== null);

      if (resolutionTimes.length === 0) return 0;

      const avg =
        resolutionTimes.reduce((sum, t) => sum + t, 0) / resolutionTimes.length;
      return Number(avg.toFixed(1));
    };

    const getLastStatus = (order: (typeof currentOrders)[0]) =>
      order.serviceOrderStatus[0]?.status;

    const countByStatus = (orders: typeof currentOrders, status: string) =>
      orders.filter((o) => getLastStatus(o) === status).length;

    const currentTotal = currentOrders.length;
    const currentClosed = countByStatus(currentOrders, 'CLOSED');

    const currentAvgResolution = calcAvgResolutionInHours(
      closedOrdersWithHistory,
    );
    const previousAvgResolution = calcAvgResolutionInHours(
      previousClosedOrdersWithHistory,
    );

    const avgResolutionOrders =
      currentTotal > 0
        ? Number(((currentClosed / currentTotal) * 100).toFixed(2))
        : 0;

    return {
      totalOrders: {
        total: currentTotal,
        percentage: this.calculatePercentageChange(
          previousOrders,
          currentTotal,
        ),
      },
      byStatus: {
        open: countByStatus(currentOrders, 'OPEN'),
        inProgress: countByStatus(currentOrders, 'IN_PROGRESS'),
        closed: {
          total: currentClosed,
          percentage: this.calculatePercentageChange(
            totalPreviousClosedOrders,
            currentClosed,
          ),
        },
      },
      avgResolutionOrders,
      avgResolutionTime: {
        hours: currentAvgResolution,
        percentage: this.calculatePercentageChange(
          previousAvgResolution,
          currentAvgResolution,
        ),
      },
    };
  }

  async getSummaryCharts(): Promise<{
    ordersByDepartment: { department: string; total: number }[];
    percentageByStatus: { status: string; percentage: number }[];
    avgResolutionTimeByDepartment: { department: string; avg: number }[];
  }> {
    const now = new Date();
    const startPeriod = new Date(now);
    startPeriod.setDate(now.getDate() - 30);

    const dateFilter = { gte: startPeriod, lte: now };

    const [ordersByDepartment, statusCounts, closedOrdersWithHistory] =
      await Promise.all([
        this.prisma.serviceOrder.groupBy({
          by: ['department'],
          where: { createdAt: dateFilter },
          _count: { department: true },
        }),

        this.prisma.serviceOrderStatus.groupBy({
          by: ['status'],
          where: { createdAt: dateFilter },
          _count: { status: true },
        }),

        this.prisma.serviceOrder.findMany({
          where: {
            createdAt: dateFilter,
            serviceOrderStatus: { some: { status: 'CLOSED' } },
          },
          select: {
            department: true,
            serviceOrderStatus: {
              where: { status: { in: ['OPEN', 'CLOSED'] } },
              orderBy: { createdAt: 'asc' },
              select: { status: true, createdAt: true },
            },
          },
        }),
      ]);

    // Calcula tempo de resolução por OS e agrupa por departamento
    const resolutionByDepartment = new Map<string, number[]>();

    for (const order of closedOrdersWithHistory) {
      const openStatus = order.serviceOrderStatus.find(
        (s) => s.status === 'OPEN',
      );
      const closedStatus = order.serviceOrderStatus.find(
        (s) => s.status === 'CLOSED',
      );

      if (!openStatus || !closedStatus) continue;

      const hours =
        (closedStatus.createdAt.getTime() - openStatus.createdAt.getTime()) /
        (1000 * 60 * 60);

      const existing = resolutionByDepartment.get(order.department) ?? [];
      resolutionByDepartment.set(order.department, [...existing, hours]);
    }

    const avgResolutionTimeByDepartment = Array.from(
      resolutionByDepartment.entries(),
    ).map(([department, times]) => ({
      department,
      avg: Number(
        (times.reduce((sum, t) => sum + t, 0) / times.length).toFixed(1),
      ),
    }));

    const totalOrders = statusCounts.reduce(
      (sum, s) => sum + s._count.status,
      0,
    );

    return {
      ordersByDepartment: ordersByDepartment.map((i) => ({
        department: i.department,
        total: i._count.department,
      })),

      percentageByStatus: statusCounts.map((i) => ({
        status: i.status,
        percentage:
          totalOrders > 0
            ? Number(((i._count.status / totalOrders) * 100).toFixed(2))
            : 0,
      })),

      avgResolutionTimeByDepartment,
    };
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
          requester: true,
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
            requester: dto.requester,
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
        void this.logger.warn(
          'ServiceOrderRepository.create: usuário não encontrado',
          {
            userId,
          },
        );
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

  private calculatePercentageChange(previous: number, current: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Number((((current - previous) / previous) * 100).toFixed(2));
  }
}
