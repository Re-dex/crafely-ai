import { Response } from "express";
import { ApiResponse } from "./ApiResponse";

// Define base types
type ActionResult<T> = T | ActionResponse<T>;

interface NormalizedResponse<T> {
  code: number;
  data: T;
  message: string;
}

interface ActionResponse<T> {
  code?: number;
  data: T; // Changed from 'any' to 'T'
  message?: string;
}

export abstract class BaseController {
  protected async handleRequest<T>(
    res: Response,
    action: () => Promise<ActionResult<T>>
  ): Promise<void> {
    try {
      const result = await action();
      const { code, data, message } = this.normalizeResponse<T>(result);
      const response = ApiResponse.success(message, data);
      res.status(code).json(response);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      const errorCode =
        error instanceof Error && "code" in error ? (error as any).code : 500;
      const response = ApiResponse.error(errorMessage, error);
      res.status(errorCode).json(response);
    }
  }

  private normalizeResponse<T>(result: ActionResult<T>): NormalizedResponse<T> {
    if (this.isActionResponse<T>(result)) {
      return {
        code: result.code ?? 200,
        data: result.data,
        message: result.message ?? "Operation success",
      };
    }

    return {
      code: 200,
      data: result as T, // Added type assertion since we know result is of type T
      message: "Operation success",
    };
  }

  private isActionResponse<T>(
    result: ActionResult<T>
  ): result is ActionResponse<T> {
    return typeof result === "object" && result !== null && "data" in result;
  }

  protected handleResponse(message, data, code = 200) {
    return {
      message,
      data,
      code,
    };
  }
}
