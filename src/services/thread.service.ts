import { prisma } from "../database/prisma";

export class ThreadService {
  async create(payload: any, userId) {
    const _payload = {
      ...payload,
      userId,
    };

    const apiKey = await prisma.thread.create({
      data: _payload,
    });
    return apiKey;
  }

  async getThreads(userId) {
    return await prisma.thread.findMany({
      where: {
        userId,
      },
    });
  }

  async deleteThread(id) {
    return await prisma.thread.delete({
      where: {
        id: id,
      },
    });
  }
}
