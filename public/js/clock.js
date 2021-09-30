const time = document.querySelector("#time");
const date = document.querySelector("#date");

const updateClock = () => {
	let now = new Date();
	let strTime = `${padLeadingZeros(now.getHours())}:${padLeadingZeros(
		now.getMinutes()
	)}`;
	let strDate = `${padLeadingZeros(now.getDate())}/${padLeadingZeros(
		now.getMonth() + 1
	)}/${padLeadingZeros(now.getFullYear())}`;
	time.innerHTML = strTime;
	date.innerHTML = strDate;
};

const initClock = () => {
	updateClock();
	window.setInterval("updateClock()", 1000);
};

function padLeadingZeros(num, size = 2) {
	// https://www.codegrepper.com/code-examples/javascript/javascript+add+leading+zeros
	var s = num + "";
	while (s.length < size) s = "0" + s;
	return s;
}

window.addEventListener("load", initClock());
