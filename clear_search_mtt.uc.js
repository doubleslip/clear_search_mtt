"use strict";
// ==UserScript==
// @name            Clear Search Mtt
// @author          doubleslip
// @version         1.0
// @description     Clears Firefox's search bar after searching.
// @include         main
// @startup         UC.clearSearchMtt.startup(win);
// @shutdown        UC.clearSearchMtt.shutdown(win);
// @onlyonce
// ==/UserScript==

UC.clearSearchMtt = {

	//Original logic
	gbOriginalHandler: null,
	tbOriginalHandler: null,

	//Modify behavior when search bar loaded
	startup: function (window) {
		if (!window.document.getElementById("searchbar")) {
			//Wait for search bar to load
			window.addEventListener("load", function () {
				UC.clearSearchMtt.modify(window);
			}, false);
		} else {
			//Already loaded; call right away
			UC.clearSearchMtt.modify(window);
		}
	},

	//Apply modifications
	modify: function (window) {

		//Check browser loaded
		if (!window.gNavToolbox) {
			console.error("Unable to get navigator:browser / document.");
			return;
		}

		//Check search bar loaded
		const searchBar = window.document.getElementById("searchbar");
		if (!searchBar) {
			console.error("Unable to get searchbar.");
			return;
		}

		//Get go button
		const searchGoImage = searchBar.getElementsByClassName("search-go-button")[0];
		if (!searchGoImage) {
			console.error("Unable to get search bar go button.");
			return;
		}

		//Get text box
		const searchTextBox = searchBar.getElementsByClassName("searchbar-textbox")[0];
		if (!searchTextBox) {
			console.error("Unable to get search bar text box.");
			return;
		}

		//Change behavior of go button when clicked
		this.gbOriginalHandler = searchGoImage.getAttribute("onclick");
		searchGoImage.setAttribute("onclick", "handleSearchCommand(event); BrowserSearch.searchBar.value = '';");

		//Change behavior of text box when enter key pressed
		this.tbOriginalHandler = event => searchTextBox.handleKeyDown(event);
		searchTextBox.removeEventListener("keydown", this.tbOriginalHandler);
		searchTextBox.setAttribute("onkeydown", "handleKeyDown(event); if (event.keyCode == KeyEvent.DOM_VK_RETURN) { BrowserSearch.searchBar.value = ''; };");

	},

	//Revert modifications
	shutdown: function (window) {

		if (!window.gNavToolbox)
			return;

		const searchBar = window.document.getElementById("context-searchselect");
		if (!searchBar)
			return;

		const searchGoImage = searchBar.getElementsByClassName("search-go-button")[0];
		if (searchGoImage && this.gbOriginalHandler) {
			searchGoImage.setAttribute("onclick", this.gbOriginalHandler);
		}

		const searchTextBox = searchBar.getElementsByClassName("searchbar-textbox")[0];
		if (searchTextBox && this.tbOriginalHandler) {
			searchTextBox.addEventListener("keydown", this.tbOriginalHandler);
			searchTextBox.removeAttribute("onkeydown");
		}
	}
}
