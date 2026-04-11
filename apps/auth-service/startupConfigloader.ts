import path from "path";
import nodeUrl from "url";
import fs from "fs";
import { KoaSwaggerUiOptions } from "koa2-swagger-ui";

export type greyboxConfigDefination = {
	methods?: ("GET" | "PATCH" | "POST" | "DELETE")[]; //allows to define/limit allowed request methods
	//site media
	files?: {
		filesUploadRolePermission: number;
		maxImageUploadSize: number;
		maxVideoUploadSize: number;
		maxOtherFilesUploadSize: number;
		dynamicallyServeFilesInDirectory?: string | string[] | string[][];
	};
	debug?: boolean;
	ignoreMailServer?: boolean; // force non-checking of mail server setup
	appMode?: "apiOnly" | "serverless" | "fullstack";
	apiMultiTenancyMode: boolean | string | string[];

	// caching configuration
	cache?: {
		max: number;
		maxSize: number;
		maxEntrySize: number;
		sizeCalculation: (value: string, key: string) => number;
		ttl: number;
		updateAgeOnGet: boolean;
	};

	// customise swager UI
	swaggerSetup?: Partial<KoaSwaggerUiOptions>;

	//site server detail
	apiEndpoint?: string;
	authEndpoint?: string; // string | {[domain: *|string]: string} | false
	authTokenValidity?: number; // days
	setApiHostToBrowserOrigin?: boolean;
	xRequestReferral?: string; //Remember to list allowable IDs on X_REQUEST_REFERRAL in .env

	allowSocialAccountSignin?: ("google" | "facebook")[];
	sitenameFull?: string;
	sitename?: string;
	siteThumbnail?: string; // in public folder
	siteAddress?: string;
	serverAddress?: string;

	//3rd party IDs | Client
	adsenseId?: string;
	measurementId?: string;
	facebookAppId?: string;

	//social media links
	brandEmail?: string;
	brandPhoneNo?: number;
	brandWhatsapp?: number;
	brandYoutube?: string;
	brandFacebook?: string;
	brandInstagram?: string;
	brandTwitter?: string;
	brandTiktok?: string;
};

const configFile =
	process.env.NODE_ENV === "development"
		? ["greybox.config.ts", "greybox.config.js", "greybox.config.mjs", "greybox.config.cjs"]
		: ["greybox.config.js", "greybox.config.mjs", "greybox.config.cjs"];

// process is useable for server environment but not browser env
//export const configExtend: greyboxConfig = {};

let isInitialized = false;
const __dirname = path.dirname(nodeUrl.fileURLToPath(import.meta.url));

// Convert the object to a string, preserving ALL functions
function stringifyWithFunctions(obj: object) {
	return JSON.stringify(
		obj,
		(key, value) => {
			if (typeof value === "function") {
				return `FUNCTION_PLACEHOLDER:${value.toString()}`;
			}
			return value;
		},
		2,
	).replace(/"FUNCTION_PLACEHOLDER:([^"]+)"/g, (match, funcStr) => {
		// Remove quotes and restore function
		return `// @ts-ignore\n${
			funcStr
				.replace(/\\n/g, "\n") // Fix newlines
				.replace(/\\"/g, '"') // Fix escaped quotes
		}`;
	});
}

// loader (call this once at app startup)
export async function loadProjectConfig() {
	console.log("loading...... project config customisatons...");
	if (isInitialized) return;

	const root = process.cwd();
	let rootDirs: string[] = [];
	/* 
	In production mode where files are built, there might not be a direct control where the built files would be, as it may or may not be in 'dist' but we at least would work with the idea that the built files will be in a directory relative to the project root.
	We are reading all entries in the root directory.

	-----
	In current implementation, we are creating a dir 'projectConfigFiles' in the greybox directory that imports current App config and all greybox core config files are imported relative to that directory. This ensures easy reuseability and compartibility improvement for frontend static loading.  

	NOte:  we also want to record where we found the config file for reference in cron and router imports if config was not in found root directory. This is not neccessary in dev env.
	*/
	if (process.env.NODE_ENV !== "development") {
		const entries = fs.readdirSync(root, { withFileTypes: true });
		// Filter to get only directories and excluding excesses
		const directories = entries
			.filter((dirent) => dirent.isDirectory() && dirent.name !== "node_modules" && dirent.name !== "logs" && !dirent.name.startsWith("."))
			.map((dirent) => dirent.name);
		if (directories.length) rootDirs = directories;
	}

	for (const file of configFile) {
		const fullPath = path.resolve(root, file);
		const exists = fs.existsSync(fullPath);

		if (exists) {
			const module = await import(nodeUrl.pathToFileURL(fullPath /* @vite-ignore */).href);
			const exportable = module?.default || module;
			//console.log("module......", module);
			// if exportable, we create a
			if (exportable) {
				// we are exporting project config fr root to a consistent referenced dire for core useage
				const projectConfigFiles = path.join(__dirname, "..", "projectConfigFiles");

				// lets reserve current config if it exists
				let currentConfig: unknown = undefined;

				// create dir if it does not exist
				if (!fs.existsSync(projectConfigFiles)) fs.mkdirSync(projectConfigFiles, { recursive: true });
				else {
					try {
						const currentConfigModule = await import(nodeUrl.pathToFileURL(path.resolve(projectConfigFiles, file) /* @vite-ignore */).href);
						currentConfig = currentConfigModule?.default || module;
						// eslint-disable-next-line @typescript-eslint/no-unused-vars
					} catch (err) {
						/*  */
					}
				}

				/// export
				const exportableConfig = {
					...exportable,
					projectConfigInitialized: ".", // signifies root directory
				};

				if (!currentConfig || stringifyWithFunctions(currentConfig) !== stringifyWithFunctions(exportableConfig))
					fs.writeFileSync(
						path.join(projectConfigFiles, file),
						`// Really nothing much to do here. THis should be an exact replica of greybox.config in the project root, and both this file in the containing directory are auto-managed

						const config = ${stringifyWithFunctions(exportableConfig)};
						  export default config;`,
					);
				isInitialized = true;
			}
			break;
		}
	}
	// if config isn't found at the project, i.e assumming this can happen when deployed to a prod environment, we check for it in inner directories on the home dir
	if (!isInitialized && rootDirs.length) {
		for (const file of configFile) {
			for (const dir of rootDirs) {
				const fullPath = path.resolve(path.join(root, dir), file);
				const exists = fs.existsSync(fullPath);
				if (exists) {
					const module = await import(nodeUrl.pathToFileURL(fullPath /* @vite-ignore */).href);
					const exportable = module?.default || module;
					//console.log("module......", module);
					if (exportable) {
						// we are exporting project config fr root to a consistent referenced dire for core useage
						const projectConfigFiles = path.join(__dirname, "..", "projectConfigFiles");

						// lets reserve current config if it exists
						let currentConfig: unknown = undefined;

						// create dir if it does not exist
						if (!fs.existsSync(projectConfigFiles)) fs.mkdirSync(projectConfigFiles, { recursive: true });
						else {
							try {
								const currentConfigModule = await import(
									nodeUrl.pathToFileURL(path.resolve(projectConfigFiles, file) /* @vite-ignore */).href
								);
								currentConfig = currentConfigModule?.default || module;
								// eslint-disable-next-line @typescript-eslint/no-unused-vars
							} catch (err) {
								/*  */
							}
						}
						/// export
						const exportableConfig = {
							...exportable,
							projectConfigInitialized: dir, // record the path where the config was found
						};
						if (!currentConfig || stringifyWithFunctions(currentConfig) !== stringifyWithFunctions(exportableConfig))
							fs.writeFileSync(
								path.join(projectConfigFiles, file),
								`// Really nothing much to do here. THis should be an exact replica of greybox.config in the project root, and both this file in the containing directory are auto-managed

								const config = ${stringifyWithFunctions(exportableConfig)};
						  export default config;`,
							);
						isInitialized = true;
					}
					break;
				}
			}
			if (!isInitialized)
				// use greybox defaults if uninitialised, setting as empty object
				fs.writeFileSync(
					path.join(path.join(__dirname, "..", "projectConfigFiles"), "greybox.config.js"),
					`const config = {};
						  export default config;`,
				);
			// exit if we found the config
			else break;
		}
	}
	return;
}
