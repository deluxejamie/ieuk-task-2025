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

const ips = new Map();
let startDate, endDate;

for (let i = 0; i < requests.length; i++) {
	const request = requests[i];
	const [
		_match,
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
	] = request.match(
		/^(\d{1,3}(?:\.\d{1,3}){3}) - ([A-Z]{2}) - \[([^\]]+)] "(\w+) ([^"]+) HTTP\/[\d.]+" (\d{3}) (\d+) "([^"]*)" "([^"]*)" (\d+)$/
	);

	if (ips.has(ip)) {
		ips.set(ip, ips.get(ip) + 1);
	} else {
		ips.set(ip, 1);
	}

	if (i == 0) startDate = dateString;
	else if (i == requests.length - 1) endDate = dateString;
}

console.log(startDate, endDate);

const top10Ips = utils.getTop10ActivityIPs([...ips.entries()]);

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
	].join("\n")
);
