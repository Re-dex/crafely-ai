import { Router } from "express";
import chatRoutes from "./chat.routes";
import wpRoutes from "./wp.routes";
import productRoute from "./product.routes";
import userRoute from "./user.routes";
import apiKeyRoute from "./apiKey.routes";
import threadRoutes from "./thread.routes";

const apiRouter = Router();
apiRouter.use("/chat", chatRoutes);
apiRouter.use("/wp", wpRoutes);
apiRouter.use("/product", productRoute);
apiRouter.use("/user", userRoute);
apiRouter.use("/api-key", apiKeyRoute);
apiRouter.use("/thread", threadRoutes);

export default apiRouter;
