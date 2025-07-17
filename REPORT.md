# IEUK Engineering Task 2025

A joint collaboration between [@deluxejamie](https://github.com/deluxejamie) and [@bluetot](https://github.com/bluetot).

## Server Optimisation

Many of the search queries took a long time to respond, but without access to the backend logic, the exact cause is unclear. It is likely that some sort of database optimisation could be beneficial, such as implementing additional database indexes, reducing the number or complexity of queries (if possible) or adding a cache layer such as Redis to reduce database load and improve efficiency. These changes would be very cheap (possibly with the exception of Redis) aligning with the limited capital available.

There may also be some optimisation to be made to requests resulting in a 429 status code (Too Many Requests). Although this could just be due to a correlation with high server load during these times, it could be worth investigating as the 403 status code (Forbidden) should have a similar server profile in terms of processing but on average 403s respond 40ms faster. Utilising a provider such as Cloudflare could allow ratelimiting to be managed upstream which would reduce the load on the server during these high traffic intervals.

## Caching

Whilst caching has been discussed at the data layer, we believe that there is more scope for caching. There is an alarming difference in average response times between countries, with a range of 71.8ms. While some of this could be attributed to the different habits of users in these countries, it remains cause for concern due to the high variation and could result in a degraded user experience. Using a service such as Cloudflare, which caches served pages using their global content delivery network, is also compatible with the restricted budget of the company.

They could further implement web page caching on their existing infrastructure using solutions such as Varnish, which has a very low performance overhead.

## Ratelimiting and Traffic Rules

6.26% of all traffic is sent by just 10 servers. It is very unlikely that a natural user is sending 5400 requests in the space of 3 days - it is also not in keeping with the average at just 10.568 requests/ip. It is easily possible to implement traffic rules even on Cloudflare's free tier, which also includes DDoS protection as standard. If the website is experiencing high traffic, it can be configured to automatically serve captchas to users - preventing crawlers, and massively increasing the cost for any attacker to have any real impact on the services.

In particular, IPs on the subnets 45.133.1.x, 35.185.0.156, 194.168.1.x and 185.220.100x.x are recorded to have sent requests in the thousands, which is a lot more than other users. One course of action could be to use Cloudflare to cap the number of requests for these IP addresses or block them entirely.

In addition, it has been noticed that many of the requests belong to the `search` route and often have duplicated parameters. Whilst there doesn't seem to be a relationship between the number of duplicated parameters and the response time based on our analysis, it could be worth investigating why many requests have duplicated parameters and whether there is some relationship with bot traffic.
