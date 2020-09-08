window.onload = function() {

	var demo = new Fizz.Demo('#canvas');

	const horses = new Fizz.DisplayGroup({
		name: 'horseGroup',
		_caching: false,
	});

	demo.stage.on(Fizz.Entity.EVENTS.DEATH, (e) => {

		demo.stage.removeChild(e.target);

	});

	demo.stage.addChild(horses);

	demo.createHorse = () => {

		var scaleFn = function(yPos)
		{
			return Fizz.math.mapToDomain([0.065, 1.5], [100, 350], yPos);
		};

		var horse = new Fizz.Sprite({
			name: 'horse',
			spritesheet: spritesheet,
			y: 250 + Fizz.math.randomInt(-125, 125),
			width: spritesheet.unitSize,
			height: spritesheet.unitSize,
			scale: new Fizz.Point(-1.2, 1),
			velocity: new Fizz.Point(Fizz.math.randomFloat(0.85, 1.45), 0),
			life: 1000,
		});

		horse.scale = horse.scale.scale(scaleFn(horse.y));

		horse.x = -horse.width;

		horse.updateCache();

		return horse;

	};

	var spritesheet = new Fizz.Spritesheet({
		source: '../assets/spritesheets/horse.png',
		frames: {
			width: 166,
			height: 166,
			count: 1,
		},
	});

	// Add five new horses a second to the group

	window.setInterval(() => {

		horses.addChild(demo.createHorse());

		horses.children.sort((a, b) => {

			if(a.width > b.width)
			{
				return 1;
			}

			if(b.width > a.width)
			{
				return -1;
			}

			return 0;

		});

		horses.updateCache();

	}, 200);

};
