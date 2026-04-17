import { ConfigDefination, default as ProjectConfig } from "../../platform.config.js";

/* Use this to overwrite project level configurations if needed */
const config: ConfigDefination = {
	...ProjectConfig,
	apiMultiTenancyMode: false,
	methods: ["GET", "PATCH", "POST", "DELETE"],
	serviceName: "Auth Service",

	serverAddress: "http://localhost",
	apiVersion: "v1",
	// caching configuration
	cache: {
		max: 5000,
		maxSize: 20000,
		maxEntrySize: 2000,
		sizeCalculation: (value: string, key: string) => {
			return value && value.length ? value.length + key.length : 1;
		},
		ttl: 1000 * 60 * 60 * 3,
		updateAgeOnGet: true,
	},

	// swagger custmisation
	swaggerSetup: {},
};

export default config;
