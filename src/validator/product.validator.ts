import { body, ValidationChain } from "express-validator";

export class ProductValidator {
  static readonly generate: ValidationChain[] = [
    body("prompt").trim().notEmpty().withMessage("Prompt is required"),
  ];
  static readonly generateImage: ValidationChain[] = [
    body("prompt").trim().notEmpty().withMessage("Prompt is required"),
  ];
  static readonly generateDescription: ValidationChain[] = [
    body("prompt").trim().notEmpty().withMessage("Prompt is required"),
  ];
}
