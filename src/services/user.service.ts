import { prisma } from "../database/prisma";

export class UserService {
  static async findByEmail(email: string) {
    try {
      // Access User model through Prisma client
      return await prisma.$queryRaw`SELECT * FROM "User" WHERE email = ${email} LIMIT 1`;
    } catch (error) {
      console.error("Error finding user by email:", error);
      throw error;
    }
  }

  static async create(userData: any) {
    try {
      // Use raw query to create user
      const { name, email, password } = userData;
      return await prisma.$executeRaw`
        INSERT INTO "User" (id, name, email, password, "createdAt", "updatedAt") 
        VALUES (concat('usr_', gen_random_uuid()), ${name}, ${email}, ${password}, NOW(), NOW()) 
        RETURNING *
      `;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  static async findById(id: string) {
    try {
      // Access User model through Prisma client
      return await prisma.$queryRaw`SELECT * FROM "User" WHERE id = ${id} LIMIT 1`;
    } catch (error) {
      console.error("Error finding user by ID:", error);
      throw error;
    }
  }
}