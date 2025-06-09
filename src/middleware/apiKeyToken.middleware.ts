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

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res
        .status(401)
        .json({ error: "API key is required in Bearer token format" });
      return;
    }

    // Extract the API key from Bearer token
    const apiKey = authHeader.split(" ")[1];

    if (!apiKey) {
      res.status(401).json({ error: "Invalid Bearer token format" });
      return;
    }

    const storedApiKey = await prisma.apiKey.findFirst({
      where: {
        keyId: apiKey,
        active: true,
      },
      include: {
        user: true, // Include user details if needed
      },
    });

    if (!storedApiKey) {
      res.status(401).json({ error: "Invalid API key xxx" });
      return;
    }

    // Verify the hashed key
    // const isValidKey = await compareHash(apiKey, storedApiKey.hashedKey);
    // if (!isValidKey) {
    //   res.status(401).json({ error: "Invalid API key xxxx" });
    //   return;
    // }

    // Update last used timestamp
    await prisma.apiKey.update({
      where: { id: storedApiKey.id },
      data: { lastUsedAt: new Date() },
    });

    // Add user and API key info to request for use in routes

    // @ts-ignore
    req.user = storedApiKey.user;
    // @ts-ignore
    req.apiKey = storedApiKey;
    // @ts-ignore
    // console.log(req.user);

    next();
  } catch (error) {
    console.error("API key validation error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
