import re

'''
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
'''
#100.34.17.233 - NO - [01/07/2025:06:00:02] "GET /news/grammy-nominations-2024 HTTP/1.1" 302 1234 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" 269

#/^(\d{1,3}(?:\.\d{1,3}){3}) - ([A-Z]{2}) - \[([^\]]+)] "(\w+) ([^"]+) HTTP\/[\d.]+" (\d{3}) (\d+) "([^"]*)" "([^"]*)" (\d+)$/

#('99.224.121.154', 'US', '01/07/2025:06:00:22', 'GET', '/privacy-policy', '200', '1234', '-', 'Mozilla/5.0 (Linux; Android 14; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36', '248') 10

'''
ip address
counter code
date string
method
route
status code
response size
referrer
user agent
response time
    '''

with open("sample-log.log") as f:
    data = f.read().splitlines()

pattern = r'^(\d+\.\d+\.\d+\.\d+) - ([A-Z]{2}) - \[([^\]]+)\] "([^"]+) ([^"]+) HTTP\/[^"]+" (\d+) (\d+) "([^"]+)" "([^"]+)" (\d+)$'

for line in data[:10]:
    print(line)
    match = re.search(pattern, line)
    if match:
        groups = match.groups()
        print(groups, len(groups))
    print()
    
    
