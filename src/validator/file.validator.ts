import { body, ValidationChain } from "express-validator";

export class FileValidator {
  static readonly upload: ValidationChain[] = [
    body("threadId")
      .notEmpty()
      .withMessage("threadId is required")
      .isString()
      .withMessage("threadId must be a string")
      .trim(),
    body("file").custom((value, { req }) => {
      if (!req.file) {
        throw new Error("No file uploaded");
      }
      return true;
    }),
  ];

  static readonly query: ValidationChain[] = [
    body("query")
      .notEmpty()
      .withMessage("query is required")
      .isString()
      .withMessage("query must be a string")
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage("query must be between 1 and 1000 characters"),
    body("topK")
      .optional()
      .isInt({ min: 1, max: 10 })
      .withMessage("topK must be an integer between 1 and 10"),
    body("threadId")
      .notEmpty()
      .withMessage("threadId is required")
      .isString()
      .withMessage("threadId must be a string")
      .trim(),
  ];

  static readonly chat: ValidationChain[] = [
    body("message")
      .notEmpty()
      .withMessage("message is required")
      .isString()
      .withMessage("message must be a string")
      .trim()
      .isLength({ min: 1, max: 2000 })
      .withMessage("message must be between 1 and 2000 characters"),
    body("threadId")
      .notEmpty()
      .withMessage("threadId is required")
      .isString()
      .withMessage("threadId must be a string")
      .trim(),
    body("model")
      .optional()
      .isString()
      .withMessage("model must be a string")
      .trim(),
    body("topK")
      .optional()
      .isInt({ min: 1, max: 10 })
      .withMessage("topK must be an integer between 1 and 10"),
  ];
}
