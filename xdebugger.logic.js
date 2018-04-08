xdebug2 = {
	COOKIE_NAME: 'XDEBUG_SESSION',
	DEFAULT_COOKIE_VALUE: 'PHPSTORM',

	getConfig: function() {
		return new Promise(function(resolve) {
			chrome.storage.local.get(['config'], function(items) {
				resolve(items.config || {});
			});
		});
	},
	saveConfig: function(config) {
		return new Promise(function(resolve) {
			chrome.storage.local.set({config}, function() {
				resolve();
			});
		});
	}
};
