import express, { Express, Request, Response } from "express";
import apiRouter from "./routes";
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
app.get("/", (req: Request, res: Response) => {
  res.render("index", {
    title: "Crafely AI",
  });
});

const asyncHandler = (
  fn: (req: Request, res: Response, next: express.NextFunction) => Promise<any>
): express.RequestHandler => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
app.use("/api", apiRouter);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

export default app;
