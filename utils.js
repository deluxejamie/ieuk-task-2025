module.exports = {
	/**
	 *
	 * @param {Array} ips An array of IP, activity array pairs (likely the result of a <Map>.entries call)
	 * @returns {Array} An array of the top 10 ips (in the same key value pairs)
	 */
	getTop10ActivityIPs: (ips) => {
		const highestActivityIps = ips.sort(
			([_ipA, activityA], [_ipB, activityB]) => activityB - activityA
		);
		highestActivityIps.length = Math.min(highestActivityIps.length, 10);
		return highestActivityIps;
	},
};
