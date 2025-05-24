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
};
