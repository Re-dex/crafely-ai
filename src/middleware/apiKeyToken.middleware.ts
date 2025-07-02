import { PrismaClient } from "../generated/prisma";
import { Request, Response, NextFunction } from "express";
import { compare } from "bcrypt";
const prisma = new PrismaClient();
async function compareHash(plaintext: string, hash: string): Promise<boolean> {
  return compare(plaintext, hash);
}
export async function validateApiKeyToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      res
        .status(401)
        .json({ error: "API key is required in Bearer token format" });
      return;
    }

    const plainTextKey = authHeader.split(" ")[1];
    const keyIdLength = 8 + 24;
    const keyId = plainTextKey.slice(0, keyIdLength);

    const storedApiKey = await prisma.apiKey.findFirst({
      where: { keyId, active: true },
    });

    if (!storedApiKey) {
      res.status(401).json({ error: "Invalid API key" });
      return;
    }

    const isValidKey = await compareHash(plainTextKey, storedApiKey.hashedKey);
    if (!isValidKey) {
      res.status(401).json({ error: "Invalid API key" });
      return;
    }

    await prisma.apiKey.update({
      where: { id: storedApiKey.id },
      data: { lastUsedAt: new Date() },
    });

    // @ts-ignore
    req.user = storedApiKey.user;
    // @ts-ignore
    req.apiKey = storedApiKey;

    next();
  } catch (error) {
    console.error("API key validation error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
