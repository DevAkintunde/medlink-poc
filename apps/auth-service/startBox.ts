import "dotenv/config";
//import { startBox } from "./src/box/index.js";
import {  loadProjectConfig } from "./startupConfigloader.js";
//import process from "node:process";
//import { startBox } from "./box/greybox.js";

//export const RoutesDir = "app/test-routes";
//Define App server config in startBox
const StartBox = async ({
	packages,
	env
}: {
	packages: {
		cors: { origin: (string | { host: string; csp: string })[]; allowedMethods?: string; exposeHeaders?: string; allowHeaaders?: "" };
		sessionConfig: {
			key: string;
			maxAge: number;
			autoCommit: boolean;
			overwrite: boolean;
			httpOnly: boolean;
			signed: boolean;
			rolling: boolean;
			renew: boolean;
			secure: boolean; //change to true in production
			sameSite: boolean | "strict" | "lax" | "none" | undefined;
			domain?: string;
		};
	};
	env?: string;
}) => {
	await loadProjectConfig();
	const { startBox } = await import("./server.js");
	if (startBox)
		await startBox({
			packages,
			env,
		});
};
export { StartBox };
