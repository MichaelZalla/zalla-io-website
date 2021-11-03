window.onload = () => {

	// Credit: https://stackoverflow.com/a/9851769/1623811
	// Credit: https://stackoverflow.com/a/58161407/1623811

	const isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && window['safari'].pushNotification)) || !!window.navigator.userAgent.match(/Version\/[\d\.]+.*Safari/);

	if(isSafari)
	{
		document.querySelector('html').classList.add('is-safari');
		document.querySelector('body').classList.add('is-safari');
	}

	let options = {
		root: null,
		// rootMargin: '0px',
		threshold: [
			0.0,
			0.2
		],
	};

	let observer = new IntersectionObserver((entries, observer) => {

		entries.map((entry) => {

			if(entry.isIntersecting)
			{
				document.querySelector('html').classList.remove('stuck');
				document.querySelector('body').classList.remove('stuck');
				document.querySelector('header').classList.remove('stuck');
			}
			else
			{
				document.querySelector('html').classList.add('stuck');
				document.querySelector('body').classList.add('stuck');
				document.querySelector('header').classList.add('stuck');
			}

		});

	}, options);

	let target = document.querySelector('.top');

	observer.observe(target);

};
