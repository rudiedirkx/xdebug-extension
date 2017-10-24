const IMAGES = ['images/bug-gray.png', 'images/bug.png'];
const ENABLED = {};
const COOKIE_NAME = 'XDEBUG_SESSION';
const COOKIE_VALUE = 'PHPSTORM';

function updateIcon(tabId, enabled) {
	const icon = IMAGES[ Number(enabled) ];
	chrome.browserAction.setIcon({
		tabId: tabId,
		path: icon
	});
}

function getOrigin(url) {
	if (url.startsWith('view-source:')) {
		url = url.substr(12);
	}

	const u = new URL(url);
	return u.origin;
}

function isEnabledUrl(url) {
	const origin = getOrigin(url);
	const enabled = Boolean(ENABLED[origin]);
	return enabled;
}

function toggleEnabledUrl(url) {
	const origin = getOrigin(url);
	ENABLED[origin] = !ENABLED[origin];
}

// onRequest
const opt1 = {urls: ['<all_urls>']};
const opt2 = ['blocking', 'requestHeaders'];
chrome.webRequest.onBeforeSendHeaders.addListener(function(info) {
	const requestHeaders = info.requestHeaders;
	if (isEnabledUrl(info.url)) {
		var added = false;
		for (var i = requestHeaders.length - 1; i >= 0; i--) {
			const H = requestHeaders[i];
			if (H.name.toLowerCase() == 'cookie') {
				H.value += '; ' + COOKIE_NAME + '=' + COOKIE_VALUE;
				added = true;
				break;
			}
		}
		if (!added) {
			requestHeaders.push({name: 'Cookie', value: COOKIE_NAME + '=' + COOKIE_VALUE});
		}
	}
	return {requestHeaders};
}, opt1, opt2);

// onToggle
chrome.browserAction.onClicked.addListener(function(tab) {
	if (tab.url) {
		toggleEnabledUrl(tab.url);
		updateIcon(tab.id, isEnabledUrl(tab.url));
	}
});

// onTab
chrome.tabs.onActivated.addListener(function(tab) {
	chrome.tabs.get(tab.tabId, function(tab) {
		if (tab.url) {
			updateIcon(tab.id, isEnabledUrl(tab.url));
		}
	});
});
chrome.tabs.onUpdated.addListener(function(tabId, info, tab) {
	if (tab.url) {
		updateIcon(tab.id, isEnabledUrl(tab.url));
	}
});
chrome.windows.onFocusChanged.addListener(function(windowId) {
	chrome.windows.get(windowId, {"populate": true}, function(window) {
		const e = chrome.runtime.lastError; // Shut up, Chrome
		if ( !window ) return;

		for (var i = window.tabs.length - 1; i >= 0; i--) {
			const tab = window.tabs[i];
			if (tab.active && tab.url) {
				updateIcon(tab.id, isEnabledUrl(tab.url));
			}
		}
	});
});
