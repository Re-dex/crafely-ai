import { body, query, ValidationChain } from "express-validator";

export class UsageValidator {
  static readonly create: ValidationChain[] = [
    body("model").optional().isString(),
    body("provider").optional().isString(),
    body("type").optional().isString(),
    body("tokensIn").optional().isInt(),
    body("tokensOut").optional().isInt(),
    body("tokensTotal").optional().isInt(),
    body("cost").optional().isFloat(),
    body("currency").optional().isString(),
    body("metadata").optional(),
  ];

  static readonly rangeQuery: ValidationChain[] = [
    query("from").optional().isISO8601(),
    query("to").optional().isISO8601(),
  ];
}
