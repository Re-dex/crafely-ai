import { body, query, ValidationChain } from "express-validator";

export class ChatValidator {
  static readonly completion: ValidationChain[] = [
    body("prompt").optional(),
    body("instructions").trim().optional(),
    body("sessionId").trim().optional(),
  ];
  static readonly messages: ValidationChain[] = [
    query("sessionId").trim().notEmpty().withMessage("sessionId is required"),
  ];
  static readonly parseCompletion: ValidationChain[] = [
    body("sessionId").trim().notEmpty().withMessage("sessionId is required"),
    body("instructions").trim().optional(),
    body("prompt").optional(),
  ];
  // New validator for presentation parsing
  static readonly parsePresentation: ValidationChain[] = [
    body("sessionId").trim().optional(),
    body("instructions").trim().optional(),
    body("prompt").optional(),
  ];
  static readonly imageCompletion: ValidationChain[] = [
    body("prompt").trim().notEmpty().withMessage("prompt is required"),
    body("model").trim().optional(),
  ];
}
