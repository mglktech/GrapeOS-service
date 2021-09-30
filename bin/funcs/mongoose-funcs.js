module.exports.ConvertToObjects = (array) => {
	let rtnData = [];
	for (let each of array) {
		rtnData.push(each.toObject({ flattenMaps: true }));
	}
	return rtnData;
};
