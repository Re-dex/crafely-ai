import pool from "../database/connection";

export class UserService {
  async registration() {
    const result = await pool.query("SELECT * FROM todos ORDER BY id DESC");
    return result.rows;
  }
}
