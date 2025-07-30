import { Request, Response } from "express";
import { BaseController } from "../app/BaseController";
import { FreemiusService } from "../services/freemius.service";
import { SignatureUtils } from "../utils/signature.utils";

export class PaymentController extends BaseController {
  private freemiusService: FreemiusService;

  constructor() {
    super();
    this.freemiusService = new FreemiusService();
  }

  async redirect(req: Request, res: Response) {
    this.handleRequest(req, res, async () => {
      // console.log("Payment redirect query:", req.query);

      // Verify Freemius signature first
      const isSignatureValid = SignatureUtils.verifyFreemiusRequest(req);
      if (!isSignatureValid) {
        console.error("Invalid Freemius signature");
        return this.handleResponse(
          "Invalid signature",
          {
            error: "Invalid Freemius signature",
            query: req.query,
          },
          403
        );
      }

      console.log("✅ Freemius signature verified successfully");

      const { subscription_id, plan_id } = req.query;

      // Verify subscription with Freemius API
      if (subscription_id && plan_id) {
        try {
          const subscriptionResponse = await this.freemiusService.get(
            `/subscriptions/${subscription_id}.json`
          );

          if (subscriptionResponse.success) {
            console.log("Subscription verified:", subscriptionResponse.data);
            return this.handleResponse(
              "Payment successful and subscription verified",
              {
                query: req.query,
                subscription: subscriptionResponse.data,
              }
            );
          } else {
            console.error(
              "Subscription verification failed:",
              subscriptionResponse.error
            );
            return this.handleResponse(
              "Payment received but subscription verification failed",
              {
                query: req.query,
                error: subscriptionResponse.error,
              }
            );
          }
        } catch (error) {
          console.error("Error verifying subscription:", error);
          return this.handleResponse(
            "Payment received but subscription verification error",
            {
              query: req.query,
              error: error instanceof Error ? error.message : "Unknown error",
            }
          );
        }
      }

      return this.handleResponse("Payment redirect processed", req.query);
    });
  }
}
