const login = document.querySelector("#login");
const hlStatus = document.querySelector("#hl-status");
const r2rrp = document.querySelector("#r2rrp-status");
const test = document.querySelector("#test");
const fm = document.querySelector("#filemanager");
const time = document.querySelector("#time");
const date = document.querySelector("#date");
const spotify = document.querySelector("#spotify");
const hlDragTimes = document.querySelector("#hl-drag-times");

window.document.addEventListener("formHandler", handleForm, false);
async function handleForm(e) {
	console.log("Form data is as follows:");
	for (var pair of e.detail.entries()) {
		console.log(pair);
	}
	let redir = e.detail.get("redir");
	let request = new XMLHttpRequest();
	request.open("POST", redir);
	request.send(e.detail);
}

let optsAbout = {
	title: "About Me",
	width: "400px",
	height: "400px",
	x: "center",
	url: "/about",
	onblur: function () {
		this.setBackground("#00765B");
	},
};
let optsLogin = {
	title: "Login",
	// modal: true,
	width: "400px",
	height: "400px",
	x: "center",
	// top: 50,
	// right: 50,
	// bottom: 50,
	// left: 50,
	html: "",
	// onfocus: function () {
	// 	this.setBackground("#00AD8D");
	// },
	onblur: function () {
		this.setBackground("#00765B");
	},
};

spotify.addEventListener("click", () => {
	if (window.screen.width < window.screen.height && window.screen.width < 450) {
		const box = winBox({
			title: "Spotify - Listen In",
			width: "100%",
			height: "200px",
			x: "bottom",
			bottom: 50,
			y: "right",
			url: "/api/spotify/widget",
			//url:"/api/public/fm/home"
		});
	} else {
		const box = winBox({
			title: "Spotify - Listen In",
			width: "450px",
			height: "200px",
			x: "bottom",
			bottom: 50,
			y: "right",
			url: "/api/spotify/widget",
			//url:"/api/public/fm/home"
		});
	}
});

fm.addEventListener("click", () => {
	const box = winBox({
		title: "Home",
		width: "800px",
		height: "600px",
		x: "center",
		y: "center",
		url: "/api/filemanager/home",
		//url:"/api/public/fm/home"
	});
});

hlStatus.addEventListener("click", () => {
	const box = winBox({
		title: "HighLife Roleplay Server Status",
		width: "400px",
		height: "500px",
		url: "/public/apps/serverStatus/highlife",
	});
});

hlDragTimes.addEventListener("click", () => {
	const box = winBox({
		title: "Highlife Live Drag Times",
		width: "1024px",
		height: "800px",
		x: "center",
		url: "/api/bespoke/highlife/dragtimes/",
	});
});

r2rrp.addEventListener("click", () => {
	const box = winBox({
		title: "Rags 2 Riches RP",
		width: "400px",
		height: "500px",
		url: "/public/apps/serverStatus/r2rrp",
	});
});
mdfile.addEventListener("click", () => {
	const box = winBox({
		title: "mdfile",
		width: "400px",
		height: "500px",
		url: "/articles/test",
	});
});

login.addEventListener("click", () => {
	const box = winBox({
		title: "Login",
		width: "400px",
		height: "400px",
		x: "right",
		y: "bottom",
		bottom: 50,
		url: "/auth/login",
	});
});

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

date.addEventListener("load", initClock());

const winBox = (opts) => {
	const defaultOpts = {
		onfocus: function () {
			if (window.screen.width < this.width) {
				this.maximize(true);
			}
		},

		onblur: function () {},
	};
	let allOpts = Object.assign({}, opts, defaultOpts);
	//console.log(allOpts);
	return new WinBox(allOpts);
};

function padLeadingZeros(num, size = 2) {
	// https://www.codegrepper.com/code-examples/javascript/javascript+add+leading+zeros
	var s = num + "";
	while (s.length < size) s = "0" + s;
	return s;
}
