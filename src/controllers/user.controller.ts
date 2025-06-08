import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { ApiResponse } from "../types";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async registration(req: Request, res: Response<any>) {
    try {
      const request: any = req.body;
      const response = await this.userService.registration(request);
      res.json({
        success: true,
        data: response,
      });
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
      res.status(500).json(response);
    }
  }
  async login(req: Request, res: Response<any>) {
    try {
      const request: any = req.body;
      const response = await this.userService.login(request);
      res.json({
        success: true,
        message: "Login success",
        data: response,
      });
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
      res.status(500).json(response);
    }
  }
}
