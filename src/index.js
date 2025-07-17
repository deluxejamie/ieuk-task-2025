const fs = require("node:fs");
const path = require("node:path");
const utils = require("./utils");

/**
 * My initial approach is to start with some exploratory analysis.
 */

// read file and split lines
const requests = fs
	.readFileSync(path.join(__dirname + "/../sample-log.log"), {
		encoding: "utf-8",
	})
	.split("\n");

/* Maps */
const ips = new Map();
const routes = new Map();
const routesRTSum = new Map();

const exitCodes = new Map();
const exitCodesRTSum = new Map();
const countryCodes = new Map();
const countryCodesRTSum = new Map();
const paramCounts = new Map();
const paramCountRTSum = new Map();

let startDate, endDate;

/* Loop */
for (let i = 0; i < requests.length - 1; i++) {
	const request = requests[i];
	const match = request.match(
		/^(\d{1,3}(?:\.\d{1,3}){3}) - ([A-Z]{2}) - \[([^\]]+)] "(\w+) ([^"]+) HTTP\/[\d.]+" (\d{3}) (\d+) "([^"]*)" "([^"]*)" (\d+)/
	);
	// This log line does not conform to the log file standard
	if (!match) continue;
	const [
		ip,
		countryCode,
		dateString,
		method,
		route,
		statusCode,
		responseSize,
		referrer,
		userAgent,
		responseTime,
	] = match.slice(1);

	utils.incrementCounter(ips, ip);
	utils.incrementCounter(routes, route);
	utils.incrementCounter(exitCodes, statusCode);
	utils.addValue(exitCodesRTSum, statusCode, responseTime);
	utils.incrementCounter(countryCodes, countryCode);
	utils.addValue(countryCodesRTSum, countryCode, responseTime);
	utils.addValue(routesRTSum, route, responseTime);

	const paramsString = route.split("?");
	if (paramsString.length > 1) {
		const searchParams = new URLSearchParams(paramsString[1]);
		score = utils.scoreCounter(utils.Counter(searchParams));
		utils.incrementCounter(paramCounts, score);
		utils.addValue(paramCountRTSum, score, responseTime);
	}

	if (i == 0) startDate = dateString;
	else if (i == requests.length - 2) endDate = dateString;
}

/* convert maps into averages, and get top 10 */

const top10Ips = utils.getTop10ByKVP([...ips.entries()]);
const averageResponseSpeedByStatusCode = utils.averageRT(
	exitCodesRTSum,
	exitCodes
);
const averageResponseTimeByCountryCode = utils.averageRT(
	countryCodesRTSum,
	countryCodes
);
const averageResponseSpeedByRoute = utils.averageRT(routesRTSum, routes);
const averageResponseTimeByParamCount = utils.averageRT(
	paramCountRTSum,
	paramCounts
);
const activityByHighestActivityIps = top10Ips.reduce(
	(prev, [_ip, activity]) => prev + activity,
	0
);

/* save to file */

const paramCountObj = utils.sortMap(new Map(averageResponseTimeByParamCount));
const routeResponseTimeObj = Object.fromEntries(
	utils.sortMap(new Map(averageResponseSpeedByRoute))
);
const ipObj = Object.fromEntries(utils.sortMap(ips));
const routesObj = Object.fromEntries(utils.sortMap(routes));

utils.saveToFile("paramCountTimes.json", paramCountObj);
utils.saveToFile("routeTimes.json", routeResponseTimeObj);
utils.saveToFile("ips.json", ipObj);
utils.saveToFile("routes.json", routesObj);

/* print to terminal */

console.log(
	[
		`Total Requests: ${requests.length}`,
		`Unique IPs: ${ips.size}`,
		`Log Interval: ${startDate} - ${endDate}`,
		`Average Number of Requests per IP: ${requests.length / ips.size}`,
		`Average Number of Requests by Top 10 IPs: ${
			activityByHighestActivityIps / 10
		}`,
		`Proportion of Requests made by Top 10 IPs: ${
			(activityByHighestActivityIps * 100) / requests.length
		}%`,
		`\nAverage Response Time By Status Code`,
		...averageResponseSpeedByStatusCode.map(
			([code, time]) => `Status ${code} : ${time.toFixed(5)}`
		),
		// `\nAverage Response Time by Route`,
		// ...top10RoutesByAverageResponseSpeed.map(
		//     ([route, time]) => `Route ${route} : ${time.toFixed(5)}`
		// ),

		`\nAverage Response Time By Country Code`,
		...averageResponseTimeByCountryCode.map(
			([country, time]) => `Country ${country} : ${time.toFixed(5)}`
		),
	].join("\n")
);
