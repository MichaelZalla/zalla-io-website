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

	stage.on(Fizz.Entity.EVENTS.DEATH, (e) => {

		stage.removeChild(e.target);

	});

	var emitter = new Fizz.DisplayEntity({
		position: new Fizz.Point(
			stage.canvas.width / 2 - 32,
			stage.canvas.height / 2 - 32
		),
		size: new Fizz.Point(64, 64),
	});

	emitter.name = 'emitter';

	emitter.alpha = 0;

	stage.addChild(emitter);

	const renderer = new Fizz.RAFRenderer(stage, null, false);

	renderer.start();

	function generateParticle()
	{

		// Generate a velocity for the node

		var velocity = new Fizz.Point(Math.random() - 0.5, Math.random() * -2);

		// Instantiate a new node, assigning it some properties, including a lifespan

		var node = new Fizz.DisplayEntity({
			position: new Fizz.Point(
				emitter.x + emitter.width / 2,
				emitter.y + emitter.height / 2
			),
			size: new Fizz.Point(3, 3),
		});

		node.caching = true;

		node.name = 'node';

		node.life = (Math.floor(5000 / (1000 / 60))) + 1;

		var scale = Fizz.math.randomFloat(0.5, 1.5);

		node.scale.x = node.scale.y = scale;

		node.velocity = velocity;

		node.acceleration = new Fizz.Point(0, 0.01);

		return node;

	};

	var deltaT = 1000 / 240;

	(function tick() {

		window.setTimeout(() => {

			if(KeyStates[AsciiKeyCodes.UpArrow])
			{
				emitter.velocity.y -= 0.005;
			}

			if(KeyStates[AsciiKeyCodes.DownArrow])
			{
				emitter.velocity.y += 0.005;
			}

			if(KeyStates[AsciiKeyCodes.LeftArrow])
			{
				emitter.velocity.x -= 0.005;
			}

			if(KeyStates[AsciiKeyCodes.RightArrow])
			{
				emitter.velocity.x += 0.005;
			}

			if(emitter.x < 0)
			{
				emitter.x = 640;
			}

			if(emitter.x > 640)
			{
				emitter.x = 0;
			}

			if(emitter.y < 0)
			{
				emitter.y = 480;
			}

			if(emitter.y > 480)
			{
				emitter.y = 0;
			}

			// Add a new node to the space

			stage.addChild(
				generateParticle()
			);

			stage.update(deltaT);

			tick();

		}, deltaT);

	}());

});
