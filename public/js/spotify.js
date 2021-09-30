const spotify = document.querySelector("#spotify");

spotify.addEventListener("click", () => {
	if (window.screen.width < window.screen.height && window.screen.width < 450) {
		const box = winBox({
			title: "Spotify / Last.FM Scrobbler",
			width: "100%",
			height: "200px",
			x: "bottom",
			bottom: 50,
			y: "right",
			url: "/apps/spotify/widget",
			//url:"/api/public/fm/home"
		});
	} else {
		const box = winBox({
			title: "Spotify / Last.FM Scrobbler",
			width: "450px",
			height: "200px",
			x: "bottom",
			bottom: 50,
			y: "right",
			url: "/apps/spotify/widget",
			//url:"/api/public/fm/home"
		});
	}
});
