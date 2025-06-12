import { prisma } from "../database/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
export class UserService {
  private JWT_SECRET = process.env.JWT_SECRET;
  async registration(payload: any) {
    const hashedPassword = await bcrypt.hash(payload.password, 10);
    const user = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        password: hashedPassword,
      },
    });
    return user;
  }

  static async findByEmail(email) {
    return await prisma.user.findUnique({
      where: { email: email },
    });
  }

  async login(payload) {
    const user = await prisma.user.findUnique({
      where: { email: payload.email },
    });
    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isPasswordCorrect = await bcrypt.compare(
      payload.password,
      user.password
    );
    if (!isPasswordCorrect) {
      throw new Error("Invalid email or password");
    }

    const token = jwt.sign({ id: user.id }, this.JWT_SECRET);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }
}
