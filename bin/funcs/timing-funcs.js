module.exports.parseTime = (msec) => {
	/* Ref: https://stackoverflow.com/questions/1787939/check-time-difference-in-javascript
    --->> Copied from a post from 12 years ago, still very much relevant today! */
	var hh = Math.floor(msec / 1000 / 60 / 60);
	msec -= hh * 1000 * 60 * 60;
	var mm = Math.floor(msec / 1000 / 60);
	msec -= mm * 1000 * 60;
	var ss = Math.floor(msec / 1000);
	msec -= ss * 1000;
	if (hh > 0) {
		return `${hh}h ${mm}m`;
	} else if (mm > 0) {
		return `${mm}m`;
	}
	return `${ss}s`;
};
