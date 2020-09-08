window.onload = () => {

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
				document.querySelector('header').classList.remove('stuck');
			}
			else
			{
				document.querySelector('header').classList.add('stuck');
			}

		});

	}, options);

	let target = document.querySelector('.top');

	observer.observe(target);

};
