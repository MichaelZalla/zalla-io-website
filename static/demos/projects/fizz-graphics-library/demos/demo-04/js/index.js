$(() => {

	Fizz.setEnv('dev');

	const stage = new Fizz.Stage('#canvas');

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

	emitter.velocity = new Fizz.Point(0.5, 0);

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

			// Set up the emitter's y-position as a function of its x-position

			emitter.velocity.y = Math.cos(
				Fizz.math.mapToDomain(
					[
						0,
						2 * Math.PI,
					],
					[
						0,
						640,
					],
					emitter.x
				)
			) * 1.25;

			// Reset the emitters' positions if they go off-screen

			if(emitter.x < 0)
			{
				emitter.x = 640;
			}

			if(emitter.x > 640)
			{
				stage.removeChild(emitter);

				stage.empty();

				emitter.x = 0;

				stage.addChild(emitter);
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
