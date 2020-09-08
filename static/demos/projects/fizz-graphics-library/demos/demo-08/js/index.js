$(() => {

	// Create a Stage to start rendering content to the canvas

	var demo = new Fizz.Demo('#canvas');

	demo.stage.on(Fizz.Entity.EVENTS.DEATH, (e) => {

		demo.stage.removeChild(e.target);

	});

	var makeASprite = function(spritesheet, texture) {

		var sprite = new Fizz.Sprite({
			position: new Fizz.Point(
				demo.stage.centerPoint.x - 60,
				demo.stage.centerPoint.y - 40
			),
			size: new Fizz.Point(16, 16),
			scale: new Fizz.Point(4, 4),
			alpha: 0.95,
			velocity: new Fizz.Point(
				1.5 * Fizz.math.randomFloat(-2, 2),
				1.5 * Fizz.math.randomFloat(-2, 2),
			),
			spritesheet: spritesheet,
			// texture: texture,
			life: 200,
		});

		if(Fizz.math.randomInt(1))
		{
			sprite.velocity.x *= -1;
		}

		if(Fizz.math.randomInt(1))
		{
			sprite.velocity.y *= -1;
		}

		sprite.texture = texture;

		sprite.updateCache();

		return sprite;

	};

	var emitSomeSprites = (e) => {

		const spritesheet = e.target;

		var runEmitCycle = () => {

			window.setTimeout(function() {

				// Create a new random Sprite and add it to the stage

				const texture = Fizz.math.randomInt(6);

				var randomSprite = makeASprite(
					spritesheet,
					texture
				);

				demo.stage.addChild(randomSprite);

				// Recursive call

				runEmitCycle();

			}.bind(this), 75);
		};

		runEmitCycle();

	};

	// Create a Spritesheet to use for our Sprites

	var spritesheet = new Fizz.Spritesheet({
		source: '../assets/spritesheets/tiles-alpha.png',
		frames: {
			width: 16,
			height: 16,
			count: 12,
		},
	});

	spritesheet.on(Fizz.Spritesheet.EVENTS.LOAD, emitSomeSprites);

});
