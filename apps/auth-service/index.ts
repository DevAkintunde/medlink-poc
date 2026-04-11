import "dotenv/config";
import { init } from "./server.js";
//import process from "node:process";

//Define App server config in startBox
export default init({
	cors: {
		origin: [
			"http://localhost",
			"http://localhost:80",
			"http://localhost:3000",
			{
				host: "http://localhost",
				csp: "'unsafe-inline' data: cdnjs.cloudflare.com fonts.googleapis.com",
			},
		],
		//allowedMethods: '',
		//exposeHeaders: '',
		//allowHeaaders: ''
	},
	sessionConfig: {
		key: process.env.COOKIE_IDENTIFIER as string,
		maxAge: 3 * 24 * 60 * 60 * 1000, // 3days
		autoCommit: true,
		overwrite: true,
		httpOnly: true,
		signed: true,
		rolling: false,
		renew: false,
		secure: process.env.NODE_ENV === "production" ? true : false, //change to true in production
		sameSite: "strict", //process.env.NODE_ENV === "production" ? "Strict" : null,
	},
});
