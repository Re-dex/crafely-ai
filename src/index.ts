import express, { Express, Request, Response } from "express";
import chatRoutes from "./routes/chat.routes";
import wpRoutes from "./routes/wp.routes";
import productRoute from "./routes/product.routes";
import cors from "cors";

const app: Express = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Crafely AI Express Server");
});

app.use("/chat", chatRoutes);
app.use("/wp", wpRoutes);
app.use("/product", productRoute);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

export default app;
