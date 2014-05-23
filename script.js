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

		selected.removeChild(example);

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

			clonedChildren[1].addEventListener("click", moveUp);
			clonedChildren[1].line = cloned;
			if (!cloned.previousSibling) { clonedChildren[1].disabled = true; }
			clonedChildren[2].addEventListener("click", moveDown);
			clonedChildren[2].line = cloned;
			if (previous) { previous.children[2].disabled = false; }

			clonedChildren[3].addEventListener("click", remove);
			clonedChildren[3].line = cloned;

			cloned.file = file;
			selected.appendChild(cloned);

			clear.disabled = false;
			read.disabled = false;
		}
		selected.add = addFile;

		function moveUp() {
			var line = this.line;
			selected.insertBefore(line, line.previousSibling);

			if (!line.previousSibling) { line.children[1].disabled = true; }
			line.children[2].disabled = false;

			line.nextSibling.children[1].disabled = false;
			line.nextSibling.children[2].disabled = !line.nextSibling.nextSibling;
		}
		function moveDown() {
			var line = this.line;
			if (line.nextSibling.nextSibling) { selected.insertBefore(line, line.nextSibling.nextSibling); }
			else { selected.appendChild(line); }

			line.children[1].disabled = false;
			if (!line.nextSibling) { line.children[2].disabled = true; }

			line.previousSibling.children[1].disabled = !line.previousSibling.previousSibling;
			line.previousSibling.children[2].disabled = false;
		}
		function remove() {
			var line = this.line;
			if (line.previousSibling && !line.nextSibling) {
				line.previousSibling.children[2].disabled = true;
			}
			if(!line.previousSibling && line.nextSibling) {
				this.line.nextSibling.children[1].disabled = true;
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

		function clearSelected() {
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
		clearSelected();

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

		var urls = [];
		var findUrls = /^(?:(?:ftp|https?):\/\/|data:image\/).+$/gm;
		function reCount() {
			urls = input.value.match(findUrls);
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

		var read = document.getElementById("by-urls-read");
		read.addEventListener("click", function () {
			images.clear();
			for (var i = 0, l = urls.length; i < l; i++) {
				images.add(urls[i]);
			}
		});

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

	methods.byUrls.click();
});