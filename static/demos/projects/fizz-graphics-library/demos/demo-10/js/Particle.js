// Create a shared Color instance (won't change)

var particleFill = Fizz.Color.RED;

var particleStroke = Fizz.Color.CLEAR;

// Define a Particle class
var Particle = Fizz.DisplayEntity.extend({

	init: function() {

		Fizz.DisplayEntity.prototype.init.call(this);

		this.life = 200;

		this.size = new Fizz.Point(8, 8);

		// Give the particle a random velocity

		var netVelocity = 2;

		this.velocity.x = Fizz.math.randomFloat(2);

		this.velocity.y = netVelocity - this.velocity.x;

		if(Fizz.math.randomInt())
		{
			this.velocity.x *= -1;
		}

		if(Fizz.math.randomInt())
		{
			this.velocity.y *= -1;
		}

		// Shared fill and stroke data

		this.fillStyle = particleFill;
		this.strokeStyle = particleStroke;

	}

});
