$(() => {

	Fizz.setEnv('dev');

	const AsciiKeyCodes = {
		UpArrow: 38,
		DownArrow: 40,
		LeftArrow: 37,
		RightArrow: 39,
	};

	const KeyStates = {};

	KeyStates[AsciiKeyCodes.UpArrow] = false;
	KeyStates[AsciiKeyCodes.DownArrow] = false;
	KeyStates[AsciiKeyCodes.LeftArrow] = false;
	KeyStates[AsciiKeyCodes.RightArrow] = false;

	const stage = new Fizz.Stage('#canvas');

	stage.on('keydown', (e) => {

		KeyStates[e.keyCode] = true;

	});

	stage.on('keyup', (e) => {

		KeyStates[e.keyCode] = false;

	});

	// Create an invisible root node which acts as the origin of our 2D space

	var root = new Fizz.DisplayGroup({
		position: [
			stage.canvas.width / 2,
			stage.canvas.height / 2,
		],
	});

	root.on(Fizz.Entity.EVENTS.DEATH, (e) => {

		root.removeChild(e.target);

	});

	// Render two axes to mark the global origin

	var xAxis = new Fizz.DisplayEntity({
		position: [-1024, 0],
		size: [2048, 0.5],
	});

	var yAxis = new Fizz.DisplayEntity({
		position: [0, -1024],
		size: [0.5, 2048],
	});

	xAxis.strokeStyle = yAxis.strokeStyle = 'rgb(140, 140, 140)';

	// Axes are positioned relative to the global origin

	stage.addChild(root);

	root.addChild(xAxis, yAxis);

	const renderer = new Fizz.RAFRenderer(stage, null, false);

	renderer.start();

	var deltaT = 1000 / 60;

	(function tick() {

		window.setTimeout(() => {

			// Reposition the global origin to give the illusion that the user is 'moving' around the canvas

			if(KeyStates[AsciiKeyCodes.UpArrow])
			{
				root.y -= 5;
			}

			if(KeyStates[AsciiKeyCodes.DownArrow])
			{
				root.y += 5;
			}

			if(KeyStates[AsciiKeyCodes.LeftArrow])
			{
				root.x -= 5;
			}

			if(KeyStates[AsciiKeyCodes.RightArrow])
			{
				root.x += 5;
			}

			// Add a new node to the space (conditionally)

			// var time = Date.now() - startTime;

			if(root.children.length < 75)
			{
				newNode = new Fizz.DisplayEntity({
					position: [0, 0],
					size: [10, 10],
					name: 'Box',
					life: 2000,
					alpha: 0.5,
				});

				newNode.velocity = new Fizz.Point(
					Math.random() - 0.5,
					Math.random() - 0.5
				);

				root.addChild(newNode);
			}

			stage.update(deltaT);

			tick();

		}, deltaT);

	}());

});
