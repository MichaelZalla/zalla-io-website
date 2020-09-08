$(() => {

	Fizz.setEnv('dev');

	const ParticleSize = 64;
	const ParticleForceStrength = 0.0225;
	const ParticleFadeDuration = 240;
	const ParticleFadeQuality = 100;

	function createParticle(
		position)
	{

		const scale = Fizz.math.randomFloat(0.5, 1.5);

		// Generate a new 'progressive' color

		const seconds = new Date().getTime() % 1000;

		const period = 2 * Math.PI;

		const pos = Fizz.math.mapToDomain(period, 1000, seconds);

		const rSine = Math.sin(pos);
		const gSine = Math.sin(Fizz.math.wrapAround(period, pos + (period / 3)));
		const bSine = Math.sin(Fizz.math.wrapAround(period, pos + (period / 3) * 2));

		const r = parseInt(Fizz.math.mapToDomain([0,255], [-1, 1], rSine));
		const g = parseInt(Fizz.math.mapToDomain([0,255], [-1, 1], gSine));
		const b = parseInt(Fizz.math.mapToDomain([0,255], [-1, 1], bSine));

		// Instantiate a new node, assigning it some properties, including a lifespan
		const node = new Fizz.DisplayEntity({
			position: new Fizz.Point(position.x - ParticleSize / 2, position.y - ParticleSize / 2),
			size: new Fizz.Point(ParticleSize, ParticleSize),
		});

		node.name = 'particle';

		node.scale.x = node.scale.y = scale;

		node.life = 200;

		node.caching = true;

		node.fillStyle = new Fizz.Color(r, g, b, 1);

		node.strokeStyle = Fizz.Color.CLEAR;

		node.velocity = new Fizz.Point(
			Fizz.math.mapToDomain([-2,2], 1, Math.random()),
			Fizz.math.mapToDomain([-2,2], 1, Math.random())
		);

		return node;

	};

	const demo = new Fizz.Demo('#canvas');

	const cursor = {
		x: 100,
		y: 100,
	};

	demo.stage.on('mousemove', (e) => {

		cursor.x = e.mouseX;
		cursor.y = e.mouseY;

	});

	demo.stage.on(Fizz.Entity.EVENTS.DEATH, (e) => {

		demo.stage.removeChild(e.target);

	});

	demo.stage.update = function(/*deltaT*/) {

		// Add a new particle to the stage

		if(demo.stage.children.length < 200)
		{
			demo.stage.addChild(
				createParticle(new Fizz.Point(cursor.x, cursor.y))
			);
		}

		// Update the existing particles in the simulation so that the particles
		// converge towards the cursor over time

		demo.stage.children.foreach((child) => {

			if(child.x < cursor.x)
			{
				child.velocity.x += ParticleForceStrength;
			}
			else if(child.x > cursor.x)
			{
				child.velocity.x -= ParticleForceStrength;
			}

			if(child.y < cursor.y)
			{
				child.velocity.y += ParticleForceStrength;
			}
			else if(child.y > cursor.y)
			{
				child.velocity.y -= ParticleForceStrength;
			}

			if(
				child.life <= ParticleFadeDuration &&
				child.life % Math.floor(ParticleFadeDuration / ParticleFadeQuality) === 0
			)
			{
				child.alpha -= 0.01 * Math.floor(ParticleFadeDuration / ParticleFadeQuality);
			}

		});

		Fizz.Stage.prototype.update.apply(demo.stage, arguments);

	}

});
