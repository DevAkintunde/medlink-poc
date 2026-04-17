import { nonAuthAccountRelatedRoutes } from "./accountPublic/index.js";
import { authRouter } from "./auth/index.js";
import { default as dbFields } from "./dbFieldsOptions/index.js";
import { Router } from "@medlink/common";

// API endpoints
const routerPrefix = "/v1";

const router = Router({
	prefix: routerPrefix,
});

// misc
router.use(dbFields.routes());

// privileged account routes
router.use(authRouter.routes());
//account sign in routes.
router.use(nonAuthAccountRelatedRoutes.routes());

export { router as v1 };
