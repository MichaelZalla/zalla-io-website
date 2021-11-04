(() => {

	if(/complete|interactive|loaded/.test(document.readyState))
	{
		init();
	}
	else
	{
		window.addEventListener('DOMContentLoaded', init);
	}

	function init()
	{

		const DefaultThemeOnLoad = 'light';

		const LocalStorageKey = 'preferences.theme.preferred';

		let currentTheme = DefaultThemeOnLoad;

		function setTheme(
			theme)
		{

			if(theme !== currentTheme)
			{

				themedContainers.map((elem) => {

					if(elem.classList.contains('theme-light'))
					{
						elem.classList.replace('theme-light', 'theme-dark');
					}
					else
					{
						elem.classList.replace('theme-dark', 'theme-light');
					}

				});

			}

			currentTheme = theme;

			themeTriggers.map((trigger) => {

				if(trigger.dataset.theme === currentTheme)
				{
					trigger.setAttribute('disabled', 'disabled');
				}
				else
				{
					trigger.removeAttribute('disabled');
				}

			});

			window.localStorage.setItem(LocalStorageKey, currentTheme);

		}

		const themedContainers = Array
			.from(
				document.body.querySelectorAll('[class*=\'theme-\']')
			)
			.concat([
				document.body
			])
			.filter((c) => !c.classList.contains('theme-fixed'));

		const themeTriggers = Array.from(
			document.body.querySelectorAll('[data-theme]')
		);

		let preferredTheme = window.localStorage.getItem(LocalStorageKey);

		if(preferredTheme && preferredTheme !== DefaultThemeOnLoad)
		{
			setTheme(preferredTheme);
		}
		else
		{
			setTheme(DefaultThemeOnLoad);
		}

		themeTriggers.map((trigger) => trigger.addEventListener('click', (e) => {
			setTheme(trigger.dataset.theme);
		}));

	}

})();
