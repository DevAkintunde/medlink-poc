import "dotenv/config";
import { InMemoryCache, logger, server, storageConnector } from "@medlink/common";
import router from "./src/api/api.entry.router.js";
import { jobScheduler } from "./src/cron/jobScheduler.js";
import { redisConfig } from "./redis.config.js";
import Redis from "ioredis";

// Setup extra starup related performanc features
const redisConnect = redisConfig();
const isRedis = async (): Promise<Redis | null> =>
	await new Promise((resolve, reject) => {
		logger.info("Redis server info: " + JSON.stringify(redisConnect));
		if (redisConnect) {
			if (typeof redisConnect === "string") return reject(new Error(redisConnect));
			let two000Count = 0; // retry tracker - shut down redis if this persistently fails to connect at start up
			const redis = new Redis({
				...redisConnect,
				// username: "default", // needs Redis >= 6
				// password: "my-top-secret",
				// db: 0, // Defaults to 0
				retryStrategy(times) {
					const delay = Math.min(times * 50, 2000);
					logger.info("Redis retry delay: " + delay);
					if (delay === 2000) two000Count++;
					// return two000Count > 3 || envs.NODE_ENV !== "production" ? null : delay;
					return delay;
				},
				// lazyConnect: true,
			})
				.on("error", (err) => {
					logger.error("Redis client init Error: ", err);
					const quitCheck = two000Count > 3 || process.env.NODE_ENV !== "production";
					if (quitCheck) {
						logger.warn("Unable to initiate a successful connect to a redis server and has been halted!");

						redis.quit();
						resolve(null);
					} else logger.info("Attempting redis re-connection...");
					//console.log("err['code']", err["code"], "= ECONNREFUSED");
				})
				.on("reconnecting", () => {
					logger.info("Redis client reconnecting...");
				})
				.on("ready", () => {
					logger.info("Redis client connected... 😊");
					console.log("Redis client connected... 😊");
					two000Count = 0; // reset retry tracker
					resolve(redis);
				});
			return redis;
		}
		logger.warn(
			"No Redis server configured! Starting up platform without any optimised caching system, and simply using in-memory caching",
		);
		resolve(null);
	});
export const redis: Redis | null = await isRedis();

// allow cache to use redis by default but fallback to in-memory cache
export const Cache = redis || InMemoryCache;

//Define App server config
export default (async () => {
	// we may need to check redis and affirm disconnection

	// lets ensure storage connectivity is good, especially when remote storage is in play
	(async () => {
		const storage = new storageConnector();
		const status = await storage.testConnectivity();
		console.log("Conversation storage connected: ", status);
		// lets ensure our storage account is setup before allowing server to start
		if (!status) throw new Error("Storage connectivity is unsuccessful and App is unable to start up");
	})();

	return server({
		cronJobs: jobScheduler,
		appRoutes: router,
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
})();
