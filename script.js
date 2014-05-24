if (!window.addEventListener && window.attachEvent) { // addEventListener
	(function () {
		(HTMLDocument || Window).prototype.addEventListener = Element.prototype.addEventListener =
			function (type, listener, useCapture) {
				return this.attachEvent("on" + type, listener, useCapture);
			};

		(HTMLDocument || Window).prototype.removeEventListener = Element.prototype.removeEventListener =
			function (type, listener, useCapture) {
				return this.detachEvent("on" + type, listener);
			};
	})();
}

window.addEventListener("load", function () {
	function cancelSubmit(e) {
		if (e.preventDefault) { e.preventDefault(); }
	}

	var byFiles = (function () {
		var byFiles = document.getElementById("by-files");
		byFiles.addEventListener("submit", cancelSubmit);

		var selection = byFiles.selection = document.getElementById("by-files-selection-input");
		
		function inputChange() {
			var files = this.files;
			for (var i = 0, l = files.length; i < l; i++) {
				if (files[i].type.indexOf("image/") === 0) {
					addFile(files[i]);
				}
			}

			this.value = "";

			updateCount();
		}
		selection.addEventListener("change", inputChange);

		var selected = byFiles.selected = document.getElementById("by-files-selected");
		var clear = selected.clear = document.getElementById("by-files-selected-clear");
		var example = selected.example = selected.children[1];
		var none = selected.children[0];

		var count = byFiles.count = document.getElementById("by-files-count");
		function updateCount() {
			var files = (selected.children[0] === none) ? 0 : selected.children.length;
			count.innerText = files + " image" + ((files !== 1) ? "s" : "");
		}

		function addFile(file) {
			if (selected.children[0] === none) { selected.removeChild(none); }

			var previous = selected.children[selected.childElementCount - 1];

			var cloned = example.cloneNode(true);
			var clonedChildren = cloned.children;
			clonedChildren[0].innerText = file.name;

			var buttons = cloned.getElementsByTagName("INPUT");
			buttons[0].addEventListener("click", moveUp);
			buttons[0].line = cloned;
			buttons[1].addEventListener("click", moveDown);
			buttons[1].line = cloned;
			buttons[2].addEventListener("click", remove);
			buttons[2].line = cloned;

			cloned.file = file;
			selected.appendChild(cloned);

			if (cloned.previousSibling) { previous.children[1].children[1].disabled = false; }
			else { buttons[0].disabled = true; }

			clear.disabled = false;
			read.disabled = false;
		}
		selected.add = addFile;

		function moveUp() {
			var line = this.line;
			selected.insertBefore(line, line.previousSibling);

			if (!line.previousSibling) { line.children[1].children[0].disabled = true; }
			line.children[1].children[1].disabled = false;

			line.nextSibling.children[1].children[0].disabled = false;
			line.nextSibling.children[1].children[1].disabled = !line.nextSibling.nextSibling;
		}
		function moveDown() {
			var line = this.line;
			if (line.nextSibling.nextSibling) { selected.insertBefore(line, line.nextSibling.nextSibling); }
			else { selected.appendChild(line); }

			line.children[1].children[0].disabled = false;
			if (!line.nextSibling) { line.children[1].children[1].disabled = true; }

			line.previousSibling.children[1].children[0].disabled = !line.previousSibling.previousSibling;
			line.previousSibling.children[1].children[1].disabled = false;
		}
		function remove() {
			var line = this.line;
			if (line.previousSibling && !line.nextSibling) {
				line.previousSibling.children[1].children[1].disabled = true;
			}
			if(!line.previousSibling && line.nextSibling) {
				line.nextSibling.children[1].children[0].disabled = true;
			}
			selected.removeChild(line);

			if (selected.children.length === 0) {
				selected.appendChild(none);
				clear.disabled = true;
				read.disabled = true;
			}

			updateCount();

			return false;
		}

		var clearSelected = byFiles.clear = function () {
			selected.innerHTML = "";
			selected.appendChild(none);
			updateCount();
			if (images) { images.clear(); }
			read.disabled = true;
		}
		clear.addEventListener("click", clearSelected);

		var read = byFiles.read = document.getElementById("by-files-read");
		read.addEventListener("click", function () {
			var children = selected.children;
			var image, imageLoader;

			if (children[0] === none) { return; }

			images.clear();
			for (var i = 0, l = children.length; i < l; i++) {
				images.add(children[i].file);
			}
		});

		return byFiles;
	})();

	var byUrls = (function () {
		var byUrls = document.getElementById("by-urls");
		byUrls.addEventListener("submit", cancelSubmit);

		var count = byUrls.count = document.getElementById("by-urls-count");

		var input = byUrls.input = document.getElementById("by-urls-input");
		var oldValue = input.value, next = null, debounce = 100;
		function change() {
			if (input.value !== oldValue) {
				images.clear();
				if (next) { clearTimeout(next); }
				next = setTimeout(reCount, debounce);
			}
		}

		var urls = byUrls.urls = [];
		var findUrls = /^(?:(?:ftp|https?):\/\/|data:image\/).+$/gm;
		function reCount() {
			urls = byUrls.urls = input.value.match(findUrls);
			if (urls == null) { urls = []; }
			count.innerHTML = urls.length + " image" + ((urls.length !== 1) ? "s" : "");

			next = null;
			oldValue = input.value;
			read.disabled = (urls.length === 0);
		}
		input.addEventListener("keydown", change);
		input.addEventListener("keyup", change);
		input.addEventListener("change", change);
		input.addEventListener("paste", change);

		var read = byUrls.read = document.getElementById("by-urls-read");
		var readRender = read.render = function () {
			var urls = byUrls.urls;
			images.clear();
			for (var i = 0, l = urls.length; i < l; i++) {
				images.add(urls[i]);
			}
		};
		read.addEventListener("click", function () { readRender(urls); });

		var link = byUrls.link = document.getElementById("by-urls-link");
		var generateLink = link.generate = function () {
			var pre = "", post = "";
			var possible = urls[0];
			for (var i = 0, l = urls.length; i < l; i++) {
				while (urls[i].indexOf(possible) !== 0) {
					possible = possible.substring(0, possible.length - 1);
				}
				if (possible.length === 0) { break; }
			}
			pre = possible;

			possible = urls[0];
			for (var i = 0, l = urls.length; i < l; i++) {
				while (urls[i].indexOf(possible) !== urls[i].length - possible.length) {
					possible = possible.substring(1);
				}
				if (possible.length === 0) { break; }
			}
			post = possible;
			console.log(pre + "..." + post);

			var url = window.location.href;
			var paramPoint = url.indexOf("?");
			if (paramPoint !== -1) { url = url.substring(0, paramPoint); }
			var compressed = pre + "|" + post;
			for (var i = 0, l = urls.length; i < l; i++) {
				compressed += "|" + urls[i].substring(pre.length, urls[i].length - post.length);
			}
			url += "?pre-post=" + encodeURIComponent(compressed);
			return url;
		};
		link.addEventListener("click", function () {
			prompt("Copy this url and share it wherever you like. It'll lead you back here, with the same image urls.", generateLink());
		});

		var decompress = byUrls.decompress = function (type, data) {
			var urls = [];
			console.log(data);

			switch (type) {
				case "pre-post":
					data = data.split("|");
					for (var i = 2, l = data.length; i < l; i++) {
						urls.push(data[0] + data[i] + data[1]);
					}
					break;
			}
			console.log(urls);

			return urls;
		};

		return byUrls;
	})();

	var methods = (function () {
		var methods = document.getElementById("methods");

		var currentInput;
		function select(e) {
			var tab = e.target || e.srcElement;
			if (currentInput !== tab.input) {
				currentInput.style.display = "none";
				tab.input.style.display = "block";
				currentInput = tab.input;
				images.clear();
			}
		}

		var radios = methods.getElementsByTagName("INPUT");

		methods.byFiles = radios[0];
		methods.byFiles.input = byFiles;
		methods.byFiles.addEventListener("change", select);

		methods.byUrls = radios[1];
		methods.byUrls.input = byUrls;
		methods.byUrls.addEventListener("change", select);

		var as = methods.getElementsByTagName("A");
		function handleLink(e) {
			if (e.preventDefault) { e.preventDefault(); }
			this.parentNode.click();
		}
		as[0].addEventListener("click", handleLink);
		as[1].addEventListener("click", handleLink);

		byUrls.style.display = "none";
		currentInput = byFiles;

		return methods;
	})();

	var images = (function () {
		var images = document.getElementById("images");

		function imageLoaded() {
			if (!this.previousSibling || (this.previousSibling.style.display !== "none")) {
				this.style.display = "";
			}

			this.continueLoading();
		}
		function imageErrored() {
			console.log("error");
			this.continueLoading();
			this.parentNode.removeChild(this);
		}
		function continueLoading() {
			var next = this.nextSibling;
			while (next && next.complete) {
				next.style.display = "";
				next = next.nextSibling;
			}
		}

		images.clear = function () {
			this.innerHTML = "";
		};
		images.add = function (image) {
			var html = new Image();
			console.log("adding", image, html);

			html.continueLoading = continueLoading;
			html.onload = imageLoaded;
			html.onerror = imageErrored;
			html.style.display = "none";
			this.appendChild(html);

			if (image instanceof File) {
				var reader = new FileReader();
				reader.onload = function (e) {
					html.src = e.target.result;
				};
				reader.readAsDataURL(image);
			}
			else if (typeof image === "string") {
				html.src = image;
			}
		};

		return images;
	})();

	byFiles.clear();

	(function () {
		var url = window.location.href;
		var left = url.indexOf("?"), right;
		if (left === -1) { return; }
		left += 1;
		right = url.indexOf("=", left);
		if (right === -1) { return; }
		var type = url.substring(left, right);
		left = right + 1;
		right = url.indexOf("&", left);
		if (right === -1) { right = url.length; }
		var urls = byUrls.decompress(type, decodeURIComponent(url.substring(left, right)));
		if (urls.length > 0) {
			methods.byUrls.click();
			byUrls.urls = urls;
			byUrls.read.render();
			byUrls.input.value = byUrls.urls.join("\n");
			byUrls.read.disabled = false;
		}
	})();
});
