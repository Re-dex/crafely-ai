import { Agent, Prisma } from "../generated/prisma";
import { prisma } from "../database/prisma";
import {
  CreateAgentDTO,
  UpdateAgentDTO,
  AgentFilters,
} from "../types/agent.types";

export class AgentService {
  async create(data: CreateAgentDTO): Promise<Agent> {
    const tools =
      typeof data.tools === "string" ? data.tools : JSON.stringify([]);

    return prisma.agent.create({
      data: {
        name: data.name,
        instructions: data.instructions,
        tools,
        context: data.context,
        user: {
          connect: {
            id: data.userId,
          },
        },
      },
    });
  }

  async findAll(userId: string): Promise<Agent[]> {
    return prisma.agent.findMany({
      where: {
        deletedAt: null,
        user: {
          id: userId,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: true,
      },
    });
  }

  async findById(id: string): Promise<Agent | null> {
    return prisma.agent.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        user: true,
      },
    });
  }

  async update(data: UpdateAgentDTO): Promise<Agent> {
    const { id, ...updateData } = data;
    return prisma.agent.update({
      where: { id },
      data: updateData,
      include: {
        user: true,
      },
    });
  }

  async delete(id: string): Promise<Agent> {
    return prisma.agent.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
      include: {
        user: true,
      },
    });
  }

  async getAgentThreads(agentId: string): Promise<any[]> {
    return prisma.thread.findMany({
      where: {
        agentId,
        deletedAt: null,
      },
    });
  }

  async createAgentThread(agentId: string, data: any): Promise<any> {
    return prisma.thread.create({
      data: {
        ...data,
        agent: {
          connect: {
            id: agentId,
          },
        },
      },
    });
  }
}
