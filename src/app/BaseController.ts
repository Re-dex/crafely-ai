/**
 * Base Controller for Crafely AI Node Application
 *
 * Provides common functionality for all controllers including:
 * - Request validation
 * - Error handling
 * - Response formatting
 * - HTTP status code resolution
 *
 * @author Crafely AI Team
 * @version 1.0.0
 */

import { Request, Response } from "express";
import { ApiResponse } from "./ApiResponse";
import { validationResult } from "express-validator";

/**
 * Union type for action results
 * Can be either the data directly or a structured response
 */
type ActionResult<T> = T | ActionResponse<T>;

/**
 * Normalized response structure for consistent API responses
 */
interface NormalizedResponse<T> {
  code: number;
  data: T;
  message: string;
}

/**
 * Action response structure for controllers
 * Allows controllers to return structured responses with custom status codes
 */
interface ActionResponse<T> {
  code?: number;
  data: T;
  message?: string;
}

/**
 * Abstract base controller class that provides common functionality
 * for all API controllers in the application
 */
export abstract class BaseController {
  /**
   * Handles HTTP requests with validation, error handling, and response formatting
   *
   * @param req - Express request object
   * @param res - Express response object
   * @param action - Async function that performs the controller action
   * @returns Promise<void>
   *
   * @example
   * ```typescript
   * async getUsers(req: Request, res: Response) {
   *   this.handleRequest(req, res, async () => {
   *     const users = await this.userService.findAll();
   *     return this.handleResponse("Users fetched successfully", users);
   *   });
   * }
   * ```
   */
  protected async handleRequest<T>(
    req: Request,
    res: Response,
    action: () => Promise<ActionResult<T>>
  ): Promise<void> {
    // Validate request data
    const validation = this.validateRequest(req);
    if (!validation.isValid) {
      this.sendValidationError(res, validation.errors!);
      return;
    }

    try {
      // Execute the controller action
      const result = await action();
      if (!result) {
        return;
      }

      // Normalize and send response
      const { code, data, message } = this.normalizeResponse<T>(result);

      // Use error response for non-2xx status codes
      const response =
        code >= 200 && code < 300
          ? ApiResponse.success(message, data)
          : ApiResponse.error(message, data);

      res.status(code).json(response);
    } catch (error) {
      // Handle errors and send error response
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      const errorCode = this.resolveHttpStatus(error);
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

  private resolveHttpStatus(error: unknown): number {
    // Prefer explicit numeric status on the error
    const anyError: any = error as any;
    if (typeof anyError?.status === "number") return anyError.status;
    if (typeof anyError?.statusCode === "number") return anyError.statusCode;
    if (typeof anyError?.code === "number") return anyError.code;

    // Handle Prisma known error codes (strings like "P2025")
    if (typeof anyError?.code === "string") {
      switch (anyError.code) {
        case "P2002": // Unique constraint violation
          return 409;
        case "P2025": // Record not found
          return 404;
        case "P2003": // FK constraint failed
          return 400;
        case "P2021": // Table not found / invalid table
          return 500;
        default:
          return 500;
      }
    }

    return 500;
  }
  protected validateRequest(req: Request): {
    isValid: boolean;
    errors?: any[];
  } {
    const errors = validationResult(req);
    return {
      isValid: errors.isEmpty(),
      errors: errors.isEmpty() ? undefined : errors.array(),
    };
  }

  protected sendValidationError(res: Response, errors: any[]): void {
    const response = ApiResponse.error("Validation failed", errors);
    res.status(400).json(response);
  }

  protected error = this.sendValidationError;

  protected success(res: Response, data, code = 200): void {
    const response = ApiResponse.success("Data fetched success", data);
    res.status(code).json(response);
  }
  protected notFound(res: Response): void {
    const response = ApiResponse.success("Data not found");
    res.status(404).json(response);
  }
}
