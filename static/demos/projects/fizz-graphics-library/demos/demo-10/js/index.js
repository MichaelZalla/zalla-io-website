$(() => {

	Fizz.setEnv('dev');

	var stage = new Fizz.Stage('#canvas');

	stage.on(Fizz.Entity.EVENTS.DEATH, (e) => {

		stage.removeChild(e.target);

	});

	// Create a renderer object to paint the stage's contents
	var renderer = new Fizz.RAFRenderer(stage, null, false);

	renderer.start();

	const deltaT = 1000 / 200;

	(function beginTick() {

		window.setTimeout(function() {

			var p = new Particle();

			p.x = stage.width / 2 - p.width / 2;
			p.y = stage.height / 2 - p.height / 2;

			stage.addChild(p);

			stage.update(deltaT);

			beginTick();

		}, deltaT);

	})();

});
