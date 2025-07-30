import express, { Express } from "express";
import apiRouter from "./routes";
import webRoutes from "./routes/web.routes";
import cors from "cors";
import path from "path";
import { clerkMiddleware } from "@clerk/express";
const app: Express = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(clerkMiddleware());
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "../public")));

// Web routes
app.use("/", webRoutes);

app.use("/api", apiRouter);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

export default app;
