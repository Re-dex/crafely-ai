import { body } from "express-validator";

export const createAgentValidator = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a string"),
  body("instructions")
    .notEmpty()
    .withMessage("Instructions are required")
    .isString()
    .withMessage("Instructions must be a string"),
  body("tools")
    .notEmpty()
    .withMessage("Tools are required")
    .isString()
    .withMessage("Tools must be a string")
    .custom((value) => {
      try {
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed)) {
          throw new Error("Tools must be a JSON array");
        }
        return true;
      } catch (error) {
        throw new Error("Tools must be a valid JSON array string");
      }
    }),
  body("context").optional().isString().withMessage("Context must be a string"),
];

export const updateAgentValidator = [
  body("name").optional().isString().withMessage("Name must be a string"),
  body("instructions")
    .optional()
    .isString()
    .withMessage("Instructions must be a string"),
  body("tools")
    .optional()
    .isString()
    .withMessage("Tools must be a string")
    .custom((value) => {
      if (!value) return true;
      try {
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed)) {
          throw new Error("Tools must be a JSON array");
        }
        return true;
      } catch (error) {
        throw new Error("Tools must be a valid JSON array string");
      }
    }),
  body("context").optional().isString().withMessage("Context must be a string"),
];
