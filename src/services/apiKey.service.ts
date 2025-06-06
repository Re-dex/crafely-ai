import { prisma } from "../database/prisma";

import crypto from "crypto";
import bcrypt from "bcrypt"; // Make sure you've installed: npm install bcrypt

export class ApiKeyService {
  async create(payload: any, user) {
    const xxx = await this.generateApiKey();
    const _payload = {
      ...payload,
      ...xxx,
      userId: user.userId,
    };

    const apiKey = await prisma.apiKey.create({
      data: _payload,
    });
    return apiKey;
  }

  async generateApiKey(environment = "test", isSecret = true) {
    const keyLength = 32; // Generates 32 bytes of random data, which is 64 hex characters
    const randomBytes = crypto.randomBytes(keyLength).toString("hex");

    let prefix = "";
    if (isSecret) {
      prefix = environment === "live" ? "sk_live_" : "sk_test_";
    } else {
      prefix = environment === "live" ? "pk_live_" : "pk_test_";
    }

    const plainTextKey = prefix + randomBytes; // The full API key shown to the user

    // Generate a separate, public keyId (e.g., for dashboard display)
    // You can make this shorter, or just a random string, doesn't need to be cryptographically strong.
    const keyIdSuffixLength = 12; // 12 bytes = 24 hex characters
    const keyIdSuffix = crypto.randomBytes(keyIdSuffixLength).toString("hex");
    const keyId = prefix + keyIdSuffix; // This keyId can be stored in plain text in the DB

    // Hash the *entire* plainTextKey for secure storage
    const saltRounds = 10; // Recommended salt rounds for bcrypt
    const hashedKey = await bcrypt.hash(plainTextKey, saltRounds);

    return {
      // plainTextKey: plainTextKey, // IMPORTANT: Show this to the user ONCE!
      hashedKey: hashedKey, // Store this in your database
      keyId: keyId, // Store this in your database (public ID)
      prefix: prefix, // Store this in your database (optional, for convenience)
    };
  }

  async getApiKeys() {
    return await prisma.apiKey.findMany();
  }
}
