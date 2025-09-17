import { body, query, ValidationChain } from "express-validator";

export class ChatValidator {
  // Reusable input validation for string or array of objects
  private static readonly inputValidation = body("input")
    .notEmpty()
    .withMessage("input is required")
    .custom((value) => {
      if (typeof value === "string") return true;
      if (Array.isArray(value)) return true;
      throw new Error("input must be a string or an array of objects");
    });
  static readonly completion: ValidationChain[] = [
    this.inputValidation,
    body("instructions").trim().optional(),
    body("threadId").trim().notEmpty().withMessage("threadId is required"),
  ];
  static readonly messages: ValidationChain[] = [
    query("threadId").trim().notEmpty().withMessage("threadId is required"),
  ];
  static readonly parseCompletion: ValidationChain[] = [
    body("threadId").trim().notEmpty().withMessage("threadId is required"),
    body("instructions").trim().optional(),
    this.inputValidation,
  ];
  static readonly slideContent: ValidationChain[] = [
    body("instructions").trim().optional(),
    this.inputValidation,
  ];
  // New validator for presentation parsing
  static readonly parsePresentation: ValidationChain[] = [
    body("threadId").trim().notEmpty().withMessage("threadId is required"),
    body("instructions").trim().optional(),
    this.inputValidation,
  ];
  static readonly imageCompletion: ValidationChain[] = [
    body("input").isObject().withMessage("input must be an object"),
    body("model").trim().optional(),
  ];
}
