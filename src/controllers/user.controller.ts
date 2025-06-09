import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { BaseController } from "../app/BaseController";
export class UserController extends BaseController {
  private service: UserService;

  constructor() {
    super();
    this.service = new UserService();
  }

  async registration(req: Request, res: Response<any>) {
    const { body } = req;
    const data = await this.service.registration(body);
    await this.handleRequest(res, async () =>
      this.handleResponse("Registration has been successfully", data, 201)
    );
  }
  async login(req: Request, res: Response<any>) {
    const { body } = req;
    const data = await this.service.login(body);
    await this.handleRequest(res, async () =>
      this.handleResponse("Login has been successfully", data)
    );
  }
}
