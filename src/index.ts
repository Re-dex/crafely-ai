import express, { Express, Request, Response, Router } from "express";
import chatRoutes from "./routes/chat.routes";
import wpRoutes from "./routes/wp.routes";
import productRoute from "./routes/product.routes";
import cors from "cors";
import path from "path";

const app: Express = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "../public")));
app.get("/", (req: Request, res: Response) => {
  res.render("index", {
    title: "Crafely AI Express Server",
    message: "Welcome to Crafely AI Express Server",
  });
});

const apiRouter = Router();
apiRouter.use("/chat", chatRoutes);
apiRouter.use("/wp", wpRoutes);
apiRouter.use("/product", productRoute);

app.use("/api/v1", apiRouter);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

export default app;
