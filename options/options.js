var $form;
var $name;

function getConfigElements() {
	return [].slice.call(document.querySelectorAll('[data-save]'));
}

function setName() {
	return new Promise(function(resolve) {
		$name.textContent = xdebug2.COOKIE_NAME;
		resolve();
	});
}

function setConfigs() {
	return xdebug2.getConfig().then(config => {
		getConfigElements().map(item => {
			if (config[item.dataset.save] != null) {
				item.value = config[item.dataset.save];
			}
		});
	});
}

function enableForm() {
	document.querySelector('button').disabled = false;
}

function getConfigs() {
	return new Promise(function(resolve) {
		var config = getConfigElements().reduce(function(config, item) {
			config[item.dataset.save] = item.value;
			return config;
		}, {});
		resolve(config);
	});
}

function notifySaved() {
	$form.classList.add('saved');
	setTimeout(() => $form.classList.remove('saved'), 2000);
}

window.addEventListener('load', function(e) {
	$form = document.querySelector('form');
	$name = document.querySelector('#cookie_name');

	$form.addEventListener('submit', function(e) {
		e.preventDefault();

		getConfigs().then(config => xdebug2.saveConfig(config)).then(notifySaved);
	});

	Promise.all([setName(), setConfigs()]).then(enableForm);
});
