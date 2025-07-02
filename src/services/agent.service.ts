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
        userId: data.userId,
      },
    });
  }

  async findAll(userId: string): Promise<Agent[]> {
    return prisma.agent.findMany({
      where: {
        deletedAt: null,
        userId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findById(id: string): Promise<Agent | null> {
    return prisma.agent.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async update(data: UpdateAgentDTO): Promise<Agent> {
    const { id, ...updateData } = data;
    return prisma.agent.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string): Promise<Agent> {
    return prisma.agent.update({
      where: { id },
      data: {
        deletedAt: new Date(),
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
