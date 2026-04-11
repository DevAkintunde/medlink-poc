import process from "node:process";

const env = process.env.NODE_ENV;
/* cron automated executions */
const cronJobs = (interval?: string) => {
	if (env === "development")
		if (interval === "0 1 * * *") {
			//daily cron at 1am
		}
	if (interval === "* * * * *") {
	}

	/* interval is period between repeated cron activity per job 
      calibrated in the cron way: "0 0 1 * *" */
	if (env !== "development")
		if (interval === "* * * * *") {
			//import app cron jobs here
			//every minute  period
		} else if (interval === "*/5 * * * *") {
			//every 5mins  period
		} else if (interval === "*/30 * * * *") {
			//every 30mins  period
		} else if (interval === "0 * * * *") {
			//hourly period
		} else if (interval === "0 */2 * * *") {
			//every 2hrs
		} else if (interval === "0 */3 * * *") {
			//every 3hrs
		} else if (interval === "0 */6 * * *") {
			//every 6hrs
		} else if (interval === "0 */12 * * *") {
			//every 12hrs
		} else if (interval === "0 1 * * *") {
			//daily cron at 1am
		} else if (interval === "0 0 * * 0") {
			//Weekly (7days) cron at 00:00 0n sundays
		} else if (interval === "0 0 1 * *") {
			//monthly. day 1 of every month
		} else if (interval === "0 0 15 * *") {
			//monthly. day 15 of every month
			// interval === "0 0 1 * *"
			//insert non specific period. This is assumed as a monthly anyways interval on server
			//also carters for wrong cron config
		}
};
export default cronJobs;
