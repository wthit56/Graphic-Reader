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
	var byFile = (function () {
		var byFile = document.getElementById("by-file");
		var selection = byFile.selection = document.getElementById("by-file-selection-input");
		
		function inputChange() {
			var files = this.files;
			for (var i = 0, l = files.length; i < l; i++) {
				if (files[i].type.indexOf("image/") === 0) {
					addFile(files[i]);
				}
			}

			this.value = "";
		}
		selection.addEventListener("change", inputChange);

		var selected = byFile.selected = document.getElementById("by-file-selected");
		var clear = selected.clear = document.getElementById("by-file-selected-clear");
		var example = selected.example = selected.children[1];
		var none = selected.children[0];

		selected.removeChild(example);

		function addFile(file) {
			if (selected.children[0] === none) { selected.removeChild(none); }

			var previous = selected.children[selected.childElementCount - 1];

			var cloned = selected.appendChild(example.cloneNode(true));
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

			return false;
		}

		function clearSelected() {
			selected.innerHTML = "";
			selected.appendChild(none);
		}
		clear.addEventListener("click", clearSelected);
		clearSelected();

		return byFile;
	})();
});