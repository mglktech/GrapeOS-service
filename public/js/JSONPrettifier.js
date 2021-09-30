var input = document.querySelector("#inputWrapper textarea");
var result = document.querySelector("#result");

function JSONPrettifier(output) {
	this.input = input;
	this.output = output;
}

JSONPrettifier.prototype.emptyOutputContainer = function () {
	while (this.output.children.length) {
		this.output.removeChild(this.output.firstChild);
	}
};

JSONPrettifier.prototype.setResult = function (message) {
	console.log(message);
	this.emptyOutputContainer();
	this.output.appendChild(message);
};

JSONPrettifier.prototype.handleToggleClick = function (e) {
	const level = Number(e.target.dataset.level) + 1,
		KeyValueWrapper = document.querySelector(
			".KeyValueWrapper[data-level='" + level + "']"
		),
		TogglePlaceholder = document.querySelector(
			".TogglePlaceholder[data-level='" + level + "']"
		);
	if (KeyValueWrapper.style.display === "none") {
		KeyValueWrapper.style.display = "block";
		TogglePlaceholder.style.display = "none";
	} else {
		KeyValueWrapper.style.display = "none";
		TogglePlaceholder.style.display = "inline";
	}
};

JSONPrettifier.prototype.handleMouseEnter = function (e) {
	let level = Number(e.target.dataset.level) + 1,
		KeyValueWrapper = document.querySelector(
			".KeyValueWrapper[data-level='" + level + "']"
		);

	KeyValueWrapper.classList.add("KeyValueWrapperBG");
	while (--level > 0) {
		KeyValueWrapper = document.querySelector(
			".KeyValueWrapper[data-level='" + level + "']"
		);
		KeyValueWrapper.classList.remove("KeyValueWrapperBG");
	}
};

JSONPrettifier.prototype.handleMouseLeave = function (e) {
	let level = Number(e.target.dataset.level) + 1,
		KeyValueWrapper = document.querySelector(
			".KeyValueWrapper[data-level='" + level + "']"
		);

	KeyValueWrapper.classList.remove("KeyValueWrapperBG");
};

JSONPrettifier.prototype.createElement = function (type, level, value) {
	if (type === "Node" || type === "KeyValue" || type === "KeyValueWrapper") {
		const div = document.createElement("div");
		div.setAttribute("class", type);
		div.setAttribute("data-level", level);
		if (type === "Node") {
			div.addEventListener("mouseenter", this.handleMouseEnter.bind(this));
			div.addEventListener("mouseleave", this.handleMouseLeave.bind(this));
		}
		return div;
	}

	if (type === "NodeStart" || type === "NodeEnd") {
		const span = document.createElement("span");
		let value;
		if (type === "NodeStart") {
			value = "{";
		}
		if (type === "NodeEnd") {
			value = "}";
		}
		const t = document.createTextNode(value);
		span.appendChild(t);
		span.setAttribute("class", type);
		span.setAttribute("data-level", level);
		return span;
	}

	if (type === "PrimitiveValue" || type === "Key" || type === "Separator") {
		const span = document.createElement("span");
		const t = document.createTextNode(value);
		span.appendChild(t);
		span.setAttribute("class", type);
		span.setAttribute("data-level", level);
		return span;
	}

	if (type === "Error") {
		const span = document.createElement("span");
		const t = document.createTextNode(level);
		span.appendChild(t);
		span.setAttribute("class", type);
		return span;
	}

	if (type === "ToggleButton") {
		const button = document.createElement("button");
		const t = document.createTextNode("+");
		button.appendChild(t);
		button.setAttribute("data-level", level);
		button.setAttribute("class", type);
		button.addEventListener("click", this.handleToggleClick.bind(this));
		return button;
	}
	if (type === "TogglePlaceholder") {
		const span = document.createElement("span");
		const t = document.createTextNode("...");
		span.appendChild(t);
		span.setAttribute("class", type);
		span.setAttribute("data-level", level);
		return span;
	}
};

JSONPrettifier.prototype.process = function (json, level) {
	if (typeof json !== "object") {
		return this.createElement("PrimitiveValue", level, json);
	}
	const parent = this.createElement("Node", level);
	parent.appendChild(this.createElement("ToggleButton", level));
	parent.appendChild(this.createElement("NodeStart", level));
	const KeyValueWrapper = this.createElement("KeyValueWrapper", level + 1);
	for (key in json) {
		const keyvalue = this.createElement("KeyValue", level + 1);
		keyvalue.appendChild(this.createElement("Key", level + 1, key));
		keyvalue.appendChild(this.createElement("Separator", level + 1, ":"));
		keyvalue.appendChild(this.process(json[key], level + 1));
		KeyValueWrapper.appendChild(keyvalue);
	}
	parent.appendChild(KeyValueWrapper);
	parent.appendChild(this.createElement("TogglePlaceholder", level + 1));
	parent.appendChild(this.createElement("NodeEnd", level));
	return parent;
};

JSONPrettifier.prototype.listenChanges = function (e) {
	this.startProcessing(e.target.value);
};

JSONPrettifier.prototype.startProcessing = function (text) {
	var json = null;
	try {
		json = JSON.parse(text);
	} catch (e) {
		this.setResult(this.createElement("Error", "Not valid json"));
	}

	if (json) {
		this.setResult(this.process(json, 0));
	}
};

JSONPrettifier.prototype.init = function (initialObj) {
	this.input.addEventListener("input", this.listenChanges.bind(this));
	if (initialObj) {
		this.input.value = JSON.stringify(initialObj);
		this.startProcessing(JSON.stringify(initialObj));
	}
};

var jSONPrettifier = new JSONPrettifier(input, result);

jSONPrettifier.init({ foo: "bar", baz: { bar: "foo", yo: { yay: "hey" } } });
