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
			}

			updateCount();

			return false;
		}

		function clearSelected() {
			selected.innerHTML = "";
			selected.appendChild(none);
			updateCount();
		}
		clear.addEventListener("click", clearSelected);
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
				if (next) { clearTimeout(next); }
				next = setTimeout(reCount, debounce);
			}
		}
		var findUrls = /^(?:ftp|https?):\/\/.+$/gm;
		function reCount() {
			var urls = input.value.match(findUrls);
			urls = urls ? urls.length : 0;
			count.innerHTML = urls + " image" + ((urls !== 1) ? "s" : "");

			next = null;
			oldValue = input.value;
		}
		input.addEventListener("keydown", change);
		input.addEventListener("keyup", change);
		input.addEventListener("change", change);
		input.addEventListener("paste", change);


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

	methods.byUrls.click();
});