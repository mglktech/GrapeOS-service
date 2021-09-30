const mongoose = require("mongoose");
const funcs = require("../bin/funcs/mongoose-funcs");
const Schema = mongoose.Schema;
const modelName = "hl-dragtime";
const mySchema = new Schema(
	{
		timestamp: Number,
		rp_name: String,
		vehicle: String,
		zero_sixty: Number,
		zero_hundred: Number,
		q_mile: Number,
		h_mile: Number,
		messageID:String,
	},
	{
		timestamps: false,
	}
);

// create model based on schema
const model = mongoose.model(modelName, mySchema);

model.get = (sort = null, searchText = null) => {
	//console.log(`sort: ${sort}`);
	let filter = {};
	if (searchText && searchText != "---") {
		const re = new RegExp(searchText, "i");
		//console.log(re);
		filter = { $or: [{ rp_name: re }, { vehicle: re }] };
	}
	if (sort == null || sort == "---") {
		return model.find(filter, {}, { limit: 100, sort: { timestamp: -1 } });
	}
	if (sort == "zero60") {
		Object.assign(filter, { zero_sixty: { $gt: -1 } });
		return model.find(filter, {}, { limit: 100, sort: { zero_sixty: 1 } });
	}
	if (sort == "zero100") {
		Object.assign(filter, { zero_hundred: { $gt: -1 } });
		return model.find(filter, {}, { limit: 100, sort: { zero_hundred: 1 } });
	}
	if (sort == "qMile") {
		Object.assign(filter, { q_mile: { $gt: -1 } });
		return model.find(filter, {}, { limit: 100, sort: { q_mile: 1 } });
	}
	if (sort == "hMile") {
		Object.assign(filter, { h_mile: { $gt: -1 } });
		return model.find(filter, {}, { limit: 100, sort: { h_mile: 1 } });
	}
};

module.exports = model;
