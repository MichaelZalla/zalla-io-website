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

	const entity1 = new Fizz.DisplayGroup({
		position: [
			stage.canvas.width/2 - 50/2,
			stage.canvas.height/2 - 50/2,
		],
		size: [
			50,
			50,
		],
	});

	const entity2 = new Fizz.DisplayEntity({
		position: [
			30,
			30,
		],
		size: [
			20,
			20,
		],
	});

	const entity3 = new Fizz.DisplayEntity({
		position: [
			30,
			30,
		],
		size: [
			10,
			10,
		],
	});

	entity1.strokeStyle = Fizz.Color.BLUE;

	// entity2.parent = entity1;
	entity2.strokeStyle = Fizz.Color.GREEN;

	// entity3.parent = entity2;
	entity3.strokeStyle = Fizz.Color.RED;

	stage.addChild(entity1);

	entity1.addChild(entity2);

	entity1.addChild(entity3);

	const renderer = new Fizz.RAFRenderer(stage, null, false);

	renderer.start();

	var deltaT = 1000 / 60;

	(function tick() {

		window.setTimeout(() => {

			if(KeyStates[AsciiKeyCodes.UpArrow])
			{
				entity1.velocity.y -= 0.0125;
				entity2.velocity.y -= 0.0100;
				entity3.velocity.y -= 0.0075;
			}

			if(KeyStates[AsciiKeyCodes.DownArrow])
			{
				entity1.velocity.y += 0.0125;
				entity2.velocity.y += 0.0100;
				entity3.velocity.y += 0.0075;
			}

			if(KeyStates[AsciiKeyCodes.LeftArrow])
			{
				entity1.velocity.x -= 0.0125;
				entity2.velocity.x -= 0.0100;
				entity3.velocity.x -= 0.0075;
			}

			if(KeyStates[AsciiKeyCodes.RightArrow])
			{
				entity1.velocity.x += 0.0125;
				entity2.velocity.x += 0.0100;
				entity3.velocity.x += 0.0075;
			}

			stage.update(deltaT);

			tick();

		}, deltaT);

	}());

});
