import { body } from "express-validator";

export const createPackageValidator = [
  body("name").isString().notEmpty().withMessage("Name is required"),
  body("price").isNumeric().withMessage("Price must be a number"),
  body("features").isArray().withMessage("Features must be an array"),
  body("interval")
    .optional()
    .isIn(["month", "year"])
    .withMessage("Interval must be month or year"),
  body("active").optional().isBoolean().withMessage("Active must be a boolean"),
];

export const updatePackageValidator = [
  body("name").optional().isString().withMessage("Name must be a string"),
  body("price").optional().isNumeric().withMessage("Price must be a number"),
  body("features")
    .optional()
    .isArray()
    .withMessage("Features must be an array"),
  body("interval")
    .optional()
    .isIn(["month", "year"])
    .withMessage("Interval must be month or year"),
  body("active").optional().isBoolean().withMessage("Active must be a boolean"),
];

export const createSubscriptionValidator = [
  body("packageId").isString().notEmpty().withMessage("Package ID is required"),
];
