module.exports = {
	/**
	 *
	 * @param {Array} ips An array of IP, value array pairs (likely the result of a <Map>.entries call)
	 * @returns {Array} An array of the top 10 ips (in the same key value pairs) sorted descending by the value associated with the ip
	 */
	getTop10ByKVP: (ips) => {
		const highestActivityIps = ips.sort(
			([_ipA, activityA], [_ipB, activityB]) => activityB - activityA
		);
		highestActivityIps.length = Math.min(highestActivityIps.length, 10);
		return highestActivityIps;
	},

	/**
	 *
	 * @param {Map} map The map to sort by the associated values
	 * @returns {Array} An array, sorted descending by the value
	 */
	sortMap: (map) => [...map.entries()].sort(([_k1, v1], [_k2, v2]) => v2 - v1),
	/**
	 *
	 * @param {Map} mapOfSums A map of the keys to a total number of occurences of the key
	 * @param {Map} mapofRTs A map of the same keys from the first parameter to the response time sum across this key
	 * @returns {Array} An array of key value pairs from key to averagre response time
	 */
	averageRT: (mapOfSums, mapofRTs) =>
		[...mapOfSums.entries()].map(([route, val]) => [
			route,
			val / mapofRTs.get(route),
		]),
};
