$(() => {

	var demo = window.demo = new Fizz.Demo('#canvas');

	// Override Stage draw method to prevent the canvas from being cleared
	// between render calls

	demo.stage.draw = function() {

		this.children.foreach((child) => {

			if(typeof child.draw === 'function')
			{
				child.draw(this._canvasContext);
			}

		}, this);

	}.bind(demo.stage);

	// Make an emitter for drawing out the EKG signal

	var emitter = new Fizz.Entity({
		position: [
			0,
			demo.stage.height / 2
		],
	});

	emitter.name = 'emitter';

	emitter.velocity.x = 3.5;

	var lastX = 0;

	var lastY = demo.stage.height / 2;

	var noiseDelta = 0;

	function drawSignal()
	{

		var ctx = demo.stage._canvasContext;

		ctx.save();

		// 'Clear' the canvas
		ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
		ctx.rect(0, 0, demo.stage.width, demo.stage.height);
		ctx.fill();

		// Draw the next segment of the signal
		ctx.beginPath();
		ctx.moveTo(lastX, lastY);
		ctx.lineTo(emitter.x, emitter.y);
		ctx.strokeStyle = '#00ff00';
		ctx.stroke();
		ctx.restore();

	}

	function updateEmitter()
	{

		lastX = emitter.x;
		lastY = emitter.y;

		if(emitter.x > 640)
		{

			var copy = emitter.clone();

			demo.stage.empty();
			demo.stage.addChild(copy);

			emitter = copy;
			emitter.x = 0;

			// Clear canvas

			lastX = 0;
			lastY = demo.stage.height / 2;

		}

		function toSinePeriod(x)
		{
			return Fizz.math.mapToDomain(
				[
					0,
					Math.PI * 2,
				],
				[
					0,
					640,
				],
				emitter.x
			);
		};

		noiseDelta += (Math.random() * 20) - 10;

		if(Math.abs(noiseDelta) > 40)
		{
			noiseDelta *= 0.75;
		}

		emitter.y = Math.sin(toSinePeriod(emitter.x)) * 100 + demo.stage.height / 2 + noiseDelta;

	};

	demo.stage.update = function() {

		drawSignal();

		updateEmitter();

		Fizz.Stage.prototype.update.apply(this, arguments);

	}.bind(demo.stage);

	demo.stage.addChild(emitter);

});
