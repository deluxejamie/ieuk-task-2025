const fs = require("node:fs");
const path = require("node:path");
const utils = require("./utils");

/**
 * My initial approach is to start with some exploratory analysis.
 */

const file = fs.readFileSync(path.join(__dirname + "/sample-log.log"), {
	encoding: "utf-8",
});

const requests = file.split("\n");

/* Maps */
const ips = new Map();
const routes = new Map();
const routesRTSum = new Map();

const exitCodes = new Map();
const exitCodesRTSum = new Map();
const countryCodes = new Map();
const countryCodesRTSum = new Map();

let startDate, endDate;

/* Loop */
for (let i = 0; i < requests.length - 1; i++) {
	const request = requests[i];
	const match = request.match(
		/^(\d{1,3}(?:\.\d{1,3}){3}) - ([A-Z]{2}) - \[([^\]]+)] "(\w+) ([^"]+) HTTP\/[\d.]+" (\d{3}) (\d+) "([^"]*)" "([^"]*)" (\d+)$/
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

	ips.set(ip, (ips.get(ip) ?? 0) + 1);
	routes.set(route, (routes.get(route) ?? 0) + 1);
	exitCodes.set(statusCode, (exitCodes.get(statusCode) ?? 0) + 1);
	exitCodesRTSum.set(
		statusCode,
		(exitCodesRTSum.get(statusCode) ?? 0) + +responseTime
	);

	countryCodes.set(countryCode, (countryCodes.get(countryCode) ?? 0) + 1);
	countryCodesRTSum.set(
		countryCode,
		(countryCodesRTSum.get(countryCode) ?? 0) + +responseTime
	);
	routesRTSum.set(route, (routesRTSum.get(route) ?? 0) + +responseTime);

	const paramsString = route.split("?");
	if (paramsString.length > 1) {
		const searchParams = new URLSearchParams(paramsString[1]);
	}

	if (i == 0) startDate = dateString;
	else if (i == requests.length - 2) endDate = dateString;
}

const top10Ips = utils.getTop10ByKVP([...ips.entries()]);
// const top10Routes = utils.getTop10ByKVP([...routes.entries()]);

const averageResponseSpeedByStatusCode = utils.averageRT(
	exitCodesRTSum,
	exitCodes
);

const averageResponseTimeByCountryCode = utils.averageRT(
	countryCodesRTSum,
	countryCodes
);

const averageResponseSpeedByRoute = utils.averageRT(routesRTSum, routes);

const routeResponseTimeObj = Object.fromEntries(
	utils.sortMap(new Map(averageResponseSpeedByRoute))
);
fs.writeFileSync(
	"routeTimes.json",
	JSON.stringify(routeResponseTimeObj, null, 2, "utf-8")
);

const activityByHighestActivityIps = top10Ips.reduce(
	(prev, [_ip, activity]) => prev + activity,
	0
);

console.log(
	[
		`Total Requests: ${requests.length}`,
		`Unique IPs: ${ips.size}`,
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

// const ipObj = Object.fromEntries(sortMap(ips));
// const routesObj = Object.fromEntries(sortMap(routes));

// fs.writeFileSync("ips.json", JSON.stringify(ipObj, null, 2, "utf-8"));
// fs.writeFileSync("routes.json", JSON.stringify(routesObj, null, 2, "utf-8"));
