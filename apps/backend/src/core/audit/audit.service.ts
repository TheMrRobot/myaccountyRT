import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async createLog(
    organizationId: string,
    userId: string | null,
    entity: string,
    entityId: string,
    action: string,
    changes?: any,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.prisma.auditLog.create({
      data: {
        organizationId,
        userId,
        entity,
        entityId,
        action,
        changes,
        ipAddress,
        userAgent,
      },
    });
  }

  async findAll(
    organizationId: string,
    options?: {
      entity?: string;
      entityId?: string;
      userId?: string;
      action?: string;
      limit?: number;
      offset?: number;
    },
  ) {
    const where: any = { organizationId };

    if (options?.entity) {
      where.entity = options.entity;
    }

    if (options?.entityId) {
      where.entityId = options.entityId;
    }

    if (options?.userId) {
      where.userId = options.userId;
    }

    if (options?.action) {
      where.action = options.action;
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: options?.limit || 100,
        skip: options?.offset || 0,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
      total,
      limit: options?.limit || 100,
      offset: options?.offset || 0,
    };
  }

  async findByEntity(organizationId: string, entity: string, entityId: string) {
    return this.prisma.auditLog.findMany({
      where: {
        organizationId,
        entity,
        entityId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByUser(organizationId: string, userId: string, limit = 100, offset = 0) {
    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: {
          organizationId,
          userId,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.auditLog.count({
        where: {
          organizationId,
          userId,
        },
      }),
    ]);

    return {
      data: logs,
      total,
      limit,
      offset,
    };
  }
}
