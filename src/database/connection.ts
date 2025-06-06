import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: "fahim",
  host: "localhost",
  database: "python_app",
  password: "",
  port: 5432,
});

export default pool;
