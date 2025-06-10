import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { BaseController } from "../app/BaseController";
import { validationResult } from "express-validator";
export class UserController extends BaseController {
  private service: UserService;

  constructor() {
    super();
    this.service = new UserService();
  }

  // Validation middleware
  async registration(req: Request, res: Response<any>) {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }
    const { body } = req;
    await this.handleRequest(res, async () => {
      const data = await this.service.registration(body);
      return this.handleResponse(
        "Registration has been successfully",
        data,
        201
      );
    });
  }
  async login(req: Request, res: Response<any>) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }
    const { body } = req;
    await this.handleRequest(res, async () => {
      const data = await this.service.login(body);
      return this.handleResponse("Login has been successfully", data);
    });
  }
}
