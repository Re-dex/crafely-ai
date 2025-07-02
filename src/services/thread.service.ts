import { prisma } from "../database/prisma";

export class ThreadService {
  async create(payload: any, user) {
    const _payload = {
      ...payload,
      userId: user.id,
    };

    const apiKey = await prisma.thread.create({
      data: _payload,
    });
    return apiKey;
  }

  async getThreads(user) {
    return await prisma.thread.findMany({
      where: {
        userId: user.userId,
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
