import { body, query, ValidationChain } from "express-validator";

export class ChatValidator {
  static readonly completion: ValidationChain[] = [
    body("prompt").optional(),
    body("instructions").trim().optional(),
    body("sessionId").trim().notEmpty().withMessage("sessionId is required"),
  ];
  static readonly messages: ValidationChain[] = [
    query("sessionId").trim().notEmpty().withMessage("sessionId is required"),
  ];
  static readonly parseCompletion: ValidationChain[] = [
    body("sessionId").trim().notEmpty().withMessage("sessionId is required"),
    body("prompt").trim().optional(),
  ];
}
