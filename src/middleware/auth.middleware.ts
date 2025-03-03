import { ApiResponse } from "../types";

// Sample API key for testing: crafely_sk_test_51MvH2nKj9LmXwZ
export const validateApiKey = (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const response: ApiResponse = {
      success: false,
      error: "Invalid authorization header format. Use 'Bearer YOUR_API_KEY'",
    };
    return res.status(401).json(response);
  }

  const apiKey = authHeader.split(" ")[1];
  // For testing purposes, you can use: crafely_sk_test_51MvH2nKj9LmXwZ
  const validApiKey = process.env.API_KEY || "crafely_sk_test_51MvH2nKj9LmXwZ";

  if (apiKey !== validApiKey) {
    const response: ApiResponse = {
      success: false,
      error: "Invalid API key",
    };
    return res.status(401).json(response);
  }

  next();
};
