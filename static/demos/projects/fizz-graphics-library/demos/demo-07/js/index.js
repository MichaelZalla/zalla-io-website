$(() => {

	// Create a new game using Fizz

	var Pong = new Fizz.Demo('#canvas');

	// Define some variables for our game

	const BallSize = 10;
	const PaddleWidth = 8;
	const StartPaddleHeight = 256;
	const StartAcceleration = 1.0025;
	const ScaleAcceleration = 1.0005;

	// Create some pieces to play our game with

	var ball = new Fizz.DisplayEntity({
		position: new Fizz.Point(320, 240),
		size: new Fizz.Point(BallSize, BallSize),
	});

	ball.name = 'ball';

	ball.cached = true;

	var playerPaddle = new Fizz.DisplayEntity({
		position: new Fizz.Point(8, 0),
		size: new Fizz.Point(PaddleWidth, 128),
	});

	playerPaddle.name = 'playerPaddle';

	playerPaddle.cached = true;

	var computerPaddle = new Fizz.DisplayEntity({
		position: new Fizz.Point(Pong.stage.width - 16, 0),
		size: new Fizz.Point(PaddleWidth, StartPaddleHeight),
	});

	computerPaddle.name = 'computerPaddle';

	computerPaddle.cached = true;

	// Customize the appearance of our game pieces

	ball.fillStyle = playerPaddle.fillStyle = computerPaddle.fillStyle = Fizz.Color.GREEN;

	ball.strokeStyle = playerPaddle.strokeStyle = computerPaddle.strokeStyle = Fizz.Color.GREEN;

	ball.lineWidth = playerPaddle.lineWidth = computerPaddle.lineWidth = 2;

	// Add the pieces to the stage (as a list), so that they will be rendered

	const cursor = {
		x: 0,
		y: 0,
	};

	Pong.stage.addChild(
		ball,
		playerPaddle,
		computerPaddle
	);

	Pong.stage.on('mousemove', (e) => {

		cursor.x = e.mouseX;
		cursor.y = e.mouseY;

	});

	//

	Pong.stage.update = function(deltaT) {

		var mouseY = cursor.y;

		// Restrict the paddle's movement so that it says within the bounds of the stage

		if(
			(mouseY > computerPaddle.height / 2) &&
			(mouseY < this.height - computerPaddle.height / 2)
		)
		{
			computerPaddle.y = mouseY - computerPaddle.height / 2;
		}

		if(
			ball.centerPoint.y > computerPaddle.centerPoint.y &&
			computerPaddle.bottom < this.height
		)
		{
			// If the ball is below the paddle, move the paddle up

			computerPaddle.y += 4.25;
		}
		else if(
			ball.centerPoint.y !== computerPaddle.centerPoint.y &&
			computerPaddle.top > 0)
		{
			// If the ball is above the paddle, move the paddle down

			computerPaddle.y -= 4.25;
		}

		if(
			ball.y < 0 ||
			ball.y > this.height - ball.height
		)
		{
			ball.velocity.y *= -1;

			ball.acceleration.y *= -ScaleAcceleration;
		}

		// The ball will react in the same way regardless of which paddle it hits

		if(ball.intersects(playerPaddle) || ball.intersects(computerPaddle))
		{

			// Reverse the direction of the ball

			ball.velocity.x *= -1;

			ball.acceleration.x *= -ScaleAcceleration;

			// Decrease the size of the paddles, increasing the difficulty of the game

			playerPaddle.height = computerPaddle.height -= 6;

			playerPaddle.updateCache();

			computerPaddle.updateCache();

		}

		if(
			ball.x < 0 ||
			ball.x > this.width
		)
		{
			Pong.reset();

			// Pong.pause();
		}

		if(Pong.uptime % 5 == 0)
		{

			var spark = new Fizz.DisplayEntity({
				position: ball.centerPoint,
				size: new Fizz.Point(2,2),
			});

			spark.cached = true;

			spark.strokeStyle = Fizz.Color.CLEAR;

			spark.fillStyle = Fizz.Color.GREEN;

			spark.scale.x = spark.scale.y = Fizz.math.randomFloat(0.5, 1.5);

			spark.velocity = ball.velocity.scale(-0.5);

			spark.velocity.x += Fizz.math.randomFloat(-0.75,0.75);

			spark.life = 75;

			spark.updateCache();

			this.addChild(spark);

		}

		Fizz.Stage.prototype.update.apply(this, arguments);

	}.bind(Pong.stage);

	Pong.reset = function() {

		ball.x = Pong.stage.centerPoint.x - ball.width / 2;
		ball.y = Pong.stage.centerPoint.y - ball.width / 2;

		ball.velocity.x = ball.velocity.y = 2;

		ball.acceleration.x = ball.acceleration.y = StartAcceleration;

		playerPaddle.y = computerPaddle.y = 0;

		playerPaddle.height = computerPaddle.height = StartPaddleHeight;

		// Re-cache our game pieces if we've adjusted their height(s)

		playerPaddle.updateCache();

		computerPaddle.updateCache();

		// Wait for one second, and then begin a new game

		window.setTimeout(() => Pong.play(), 1000);

	};

	// Finally, call 'reset' to get things going

	Pong.reset();

});
