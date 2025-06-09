import { validateApiKeyToken } from "../middleware/apiKeyToken.middleware";
import { verifyJWT } from "../middleware/jwt.middleware";

export { validateApiKeyToken as apiKeyMiddleware, verifyJWT as jwtMiddleware };
