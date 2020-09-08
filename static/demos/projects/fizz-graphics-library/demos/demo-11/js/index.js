$(() => {

	Fizz.setEnv('dev');

	function makePalette(
		mix)
	{

		var palette = [];

		var r, g, b;

		// 256-size palette

		for(var i = 0; i < 256; i++)
		{
			r = Math.floor((Fizz.math.randomInt(0, 255) + mix.r) / 2);
			g = Math.floor((Fizz.math.randomInt(0, 255) + mix.g) / 2);
			b = Math.floor((Fizz.math.randomInt(0, 255) + mix.b) / 2);

			palette.push(new Fizz.Color(r,g,b));
		}

		return palette;

	}

	function resetParticle()
	{

		// Default reset behavior

		this.reset();

		// Re-center the particle on stage

		this.x = emitter.x - this.width / 2;
		this.y = emitter.y - this.height / 2;

		// Randomize the particle's velocity

		var netVelocity = 4;

		this.velocity.x = Fizz.math.randomFloat(netVelocity);

		this.velocity.y = netVelocity - this.velocity.x;

		if(Fizz.math.randomInt())
		{
			this.velocity.x *= -1;
		}

		if(Fizz.math.randomInt())
		{
			this.velocity.y *= -1;
		}

		// Randomize particle's appearance

		this.fillStyle = palette[
			Fizz.math.randomInt(255)
		];

		this.strokeStyle = Fizz.Color.CLEAR;

	}

	function spawnParticle()
	{

		// Limit usage to 512 particles

		if(stage.children.length >= 512 - 1)
		{
			return;
		}

		var particle;

		// Try to reserve a new particle from the pool
		if(particle = pool.reserve())
		{

			// Only add an 'onDeath' listener if necessary
			if(!particle.listensFor(Fizz.Entity.EVENTS.DEATH))
			{
				particle.on(Fizz.Entity.EVENTS.DEATH, (e) => {

					stage.removeChild(e.target);

					pool.release(e.target);

				});
			}

			stage.addChild(particle);

		}

	}

	const stage = new Fizz.Stage('#canvas');

	// Generate a fill palette for randomizing particle appearance
	var palette = makePalette(Fizz.Color.WHITE);

	// Create an emitter to determine where particles emit from
	var emitter = new Fizz.Point(stage.width / 2, stage.height / 2);

	// Emit a new Particle when we click on the canvas
	stage.on('click', spawnParticle);

	// Update emitter position on mousemove
	stage.on('mousemove', (e) => {
		emitter.x = e.mouseX;
		emitter.y = e.mouseY;
	});

	// Set up an interrupt for testing
	stage.on('keydown', (e) => {

		if(e.keyCode === 13)
		{
			stage.empty();

			pool.drain();
		}

	});

	// Create a particle pool with our custom reset callback
	pool = new Fizz.EntityPool(
		new Particle(),
		128,
		false,
		resetParticle
	);

	//

	const renderer = new Fizz.RAFRenderer(stage, null, false);

	renderer.start();

	var deltaT = 1000 / 240;

	(function tick() {

		window.setTimeout(() => {

			// Add a new node to the space

			stage.update(deltaT);

			tick();

		}, deltaT);

	}());

});
