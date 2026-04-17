//import { authenticatedUser } from "./account.routes.js";
import { publicAdminRoutes } from "./publicAdmin.routes.js";
import { Router } from "@medlink/common";
import { publicClientUsers } from "./publicClientUsers.routes.js";

const router = Router("auth");

// Platform uses a combined Client and Delivery Partner user access in endpoints
router.use(publicClientUsers.routes());

// Admin access endpoints
router.use(publicAdminRoutes.routes());

export { router as nonAuthAccountRelatedRoutes };
