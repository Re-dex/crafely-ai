import { prisma } from "../database/prisma";

export class ThreadService {
  async create(payload: any, user) {
    const _payload = {
      ...payload,
      userId: user.userId,
    };

    const apiKey = await prisma.thread.create({
      data: _payload,
    });
    return apiKey;
  }

  async getApiKeys(body, user) {
    return await prisma.thread.findMany({
      where: {
        userId: user.userId,
      },
      include: {
        user: true,
      },
    });
  }
}
