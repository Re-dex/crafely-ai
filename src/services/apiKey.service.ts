import { prisma } from "../database/prisma";

import crypto from "crypto";
import bcrypt from "bcrypt"; // Make sure you've installed: npm install bcrypt

export class ApiKeyService {
  async create(payload: any, user) {
    const { hashedKey, plainTextKey, keyId, prefix } =
      await this.generateApiKey();
    const _payload = {
      ...payload,
      hashedKey,
      keyId,
      prefix,
      userId: user.userId,
    };

    await prisma.apiKey.create({
      data: _payload,
    });
    return {
      api_key: plainTextKey,
    };
  }

  async generateApiKey(environment = "test", isSecret = true) {
    const keyId =
      (isSecret
        ? environment === "live"
          ? "sk_live_"
          : "sk_test_"
        : environment === "live"
        ? "pk_live_"
        : "pk_test_") + crypto.randomBytes(12).toString("hex");

    const plainTextKey = keyId + crypto.randomBytes(40).toString("hex");
    const hashedKey = await bcrypt.hash(plainTextKey, 10);

    return {
      plainTextKey,
      hashedKey,
      keyId,
      prefix: keyId.slice(0, 8),
    };
  }

  async getApiKeys(userId) {
    const keys = await prisma.apiKey.findMany({
      where: {
        userId,
      },
    });

    return keys.map((key) => {
      const visiblePrefix = key.keyId.slice(0, 7);
      const visibleSuffix = key.keyId.slice(-5);
      const maskedKeyId = `${visiblePrefix}...........................${visibleSuffix}`;

      return {
        id: key.id,
        keyId: maskedKeyId,
        name: key.name,
        prefix: key.prefix,
        permissions: key.permissions,
        active: key.active,
        createdAt: key.createdAt,
        updatedAt: key.updatedAt,
        lastUsedAt: key.lastUsedAt,
      };
    });
  }

  async deleteApiKeys(id) {
    return await prisma.apiKey.delete({
      where: {
        id: id,
      },
    });
  }
}
