import express, { Express, Request, Response } from "express";
import apiRouter from "./routes";
import cors from "cors";
import path from "path";
import { clerkMiddleware } from "@clerk/express";
import { clerkClient, requireAuth, getAuth } from "@clerk/express";
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
app.get(
  "/api/v1/protected",
  requireAuth(),
  asyncHandler(async (req, res) => {
    // Use `getAuth()` to get the user's `userId`
    const { userId } = getAuth(req);
    console.log(userId);
    // Use Clerk's JavaScript Backend SDK to get the user's User object
    const user = await clerkClient.users.getUser(userId);

    return res.json({ user });
  })
);
app.use("/api", apiRouter);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

export default app;
