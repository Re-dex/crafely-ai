import { Request, Response } from "express";
import { BaseController } from "../app/BaseController";

export class PaymentController extends BaseController {
  async redirect(req: Request, res: Response) {
    this.handleRequest(req, res, async () => {
      console.log("Payment redirect query:", req.query);
      return this.handleResponse("Payment redirect processed", req.query);
    });
  }
}
