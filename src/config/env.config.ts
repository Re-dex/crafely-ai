import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE || "0.7"),
  },
  upstashRedis: {
    url: process.env.UPSTASH_REDIS_URL,
    token: process.env.UPSTASH_REDIS_TOKEN,
  },
  auth: {
    apiKeyHeader: "x-api-key",
  },
  freemius: {
    baseUrl: process.env.FREEMIUS_BASE_URL || "https://api.freemius.com/v1",
    apiKey: process.env.FREEMIUS_API_KEY || "458b3725a75fce22cb41eecdc162b5f6",
    productId: process.env.FREEMIUS_PRODUCT_ID || "19810",
    productSecretKey: process.env.FREEMIUS_PRODUCT_SECRET_KEY,
  },
};
