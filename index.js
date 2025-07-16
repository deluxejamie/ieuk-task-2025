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
let processed = 0;

for (let i = 0; i < requests.length - 1; i++) {
	const request = requests[i];
    const match = request.match(
		/^(\d{1,3}(?:\.\d{1,3}){3}) - ([A-Z]{2}) - \[([^\]]+)] "(\w+) ([^"]+) HTTP\/[\d.]+" (\d{3}) (\d+) "([^"]*)" "([^"]*)" (\d+)$/
	);
    if (!match) {
        console.log(i, request);
        continue;
    }
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
        responseTime
    ] = match.slice(1);
    processed++;

	if (ips.has(ip)) {
		ips.set(ip, ips.get(ip) + 1);
	} else {
		ips.set(ip, 1);
	}

	if (i == 0) startDate = dateString;
	else if (i == requests.length - 2) endDate = dateString;
}

console.log("processed: " + processed);

console.log(startDate, endDate);

const top10Ips = utils.getTop10ActivityIPs([...ips.entries()]);
console.log(top10Ips);

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
