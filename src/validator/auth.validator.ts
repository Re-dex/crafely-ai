import { body, ValidationChain } from "express-validator";
import { UserService } from "../services/user.service";
import { Prisma } from "../generated/prisma";
export class AuthValidator {
  static readonly checkEmailUniqueness = body("email").custom(
    async (value, { req }) => {
      try {
        const existingUser = await UserService.findByEmail(value);
        // For login, we want the email to exist
        if (req.path.includes("login")) {
          if (!existingUser) {
            return Promise.reject("Email not found");
          }
          return true;
        }
        // For registration, we don't want the email to exist
        if (existingUser) {
          return Promise.reject("Email already in use");
        }
        return true;
      } catch (error) {
        console.error("Email validation error:", error);
        return Promise.reject("Error checking email");
      }
    }
  );

  static readonly registration: ValidationChain[] = [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 characters long"),

    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Please provide a valid email")
      .normalizeEmail(),
    this.checkEmailUniqueness,
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/)
      .withMessage(
        "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
      ),
  ];

  static readonly login: ValidationChain[] = [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Please provide a valid email")
      .normalizeEmail(),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/)
      .withMessage(
        "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
      ),
  ];
}
