import pool from "../database/connection";
import { prisma } from "../database/prisma";
export class UserService {
  async registration() {
    const todo = await prisma.todo.create({
      data: {
        title: "todo one",
      },
    });
    return todo;
  }
}
