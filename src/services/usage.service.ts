import { prisma } from "../database/prisma";

type CreateUsageInput = {
  apiKeyId: string;
  userId: string;
  provider?: string;
  model?: string;
  type?: string;
  tokensIn?: number;
  tokensOut?: number;
  tokensTotal?: number;
  cost?: number;
  currency?: string;
  metadata?: any;
};

export class UsageService {
  async create(input: CreateUsageInput) {
    const data: any = {
      ...input,
      metadata: input.metadata as any,
    };
    return prisma.usage.create({ data });
  }

  async listByApiKey(
    apiKeyId: string,
    params: { from?: string; to?: string } = {}
  ) {
    const where: any = { apiKeyId };
    if (params.from || params.to) {
      where.createdAt = {} as any;
      if (params.from) where.createdAt.gte = new Date(params.from);
      if (params.to) where.createdAt.lte = new Date(params.to);
    }
    return prisma.usage.findMany({ where, orderBy: { createdAt: "desc" } });
  }

  async listByUser(
    userId: string,
    params: { from?: string; to?: string } = {}
  ) {
    const where: any = { userId };
    if (params.from || params.to) {
      where.createdAt = {} as any;
      if (params.from) where.createdAt.gte = new Date(params.from);
      if (params.to) where.createdAt.lte = new Date(params.to);
    }
    return prisma.usage.findMany({ where, orderBy: { createdAt: "desc" } });
  }

  async get(id: string) {
    return prisma.usage.findUnique({ where: { id } });
  }

  async delete(id: string) {
    return prisma.usage.delete({ where: { id } });
  }

  async summarizeByUser(
    userId: string,
    params: { from?: string; to?: string } = {}
  ) {
    const where: any = { userId };
    if (params.from || params.to) {
      where.createdAt = {} as any;
      if (params.from) where.createdAt.gte = new Date(params.from);
      if (params.to) where.createdAt.lte = new Date(params.to);
    }
    const [byModel, totals] = await Promise.all([
      prisma.usage.groupBy({
        by: ["provider", "model"],
        where,
        _sum: {
          tokensIn: true,
          tokensOut: true,
          tokensTotal: true,
          cost: true,
        },
      }),
      prisma.usage.aggregate({
        where,
        _sum: {
          tokensIn: true,
          tokensOut: true,
          tokensTotal: true,
          cost: true,
        },
        _count: { _all: true },
      }),
    ]);
    return { byModel, totals };
  }

  async summarizeByApiKey(
    apiKeyId: string,
    params: { from?: string; to?: string } = {}
  ) {
    const where: any = { apiKeyId };
    if (params.from || params.to) {
      where.createdAt = {} as any;
      if (params.from) where.createdAt.gte = new Date(params.from);
      if (params.to) where.createdAt.lte = new Date(params.to);
    }
    const [byModel, totals] = await Promise.all([
      prisma.usage.groupBy({
        by: ["provider", "model"],
        where,
        _sum: {
          tokensIn: true,
          tokensOut: true,
          tokensTotal: true,
          cost: true,
        },
      }),
      prisma.usage.aggregate({
        where,
        _sum: {
          tokensIn: true,
          tokensOut: true,
          tokensTotal: true,
          cost: true,
        },
        _count: { _all: true },
      }),
    ]);
    return { byModel, totals };
  }
}
