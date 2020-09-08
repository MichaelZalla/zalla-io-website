var Particle = Fizz.DisplayEntity.extend({

	init: function() {

		this._fadeDuration = 240;
		this._fadeQuality = 8;

		Fizz.DisplayEntity.prototype.init.call(this, null, false);

		this.size = new Fizz.Point(50, 50);

		this.acceleration.x = 0.01;
		this.acceleration.y = 0.01;

		this.snapToPixel = true;
		this.strokeStyle = Particle.STROKE_STYLE;

		this.reset();

	},

	reset: function() {

		this.alpha = 1;

		this.life = Particle.DEFAULT_LIFE;

	},

	update: function(deltaT) {

		Fizz.DisplayEntity.prototype.update.call(this, deltaT);

		var s = this.stage; // method call!

		// Might be 'undefined' or 'null'
		if(s)
		{

			if(this.left <= 0 || this.right >= s.width)
			{
				this.x = (this.left <= 0) ? 2 : s.width - this.width - 2;
				this.velocity.x *= -1;
				this.acceleration.x += 0.01;
			}
			else
			{
				this.acceleration.x *= 0.9;
			}

			if(this.top <= 0 || this.bottom >= s.height)
			{
				this.y = (this.top <= 0) ? 2 : s.height - this.height - 2;
				this.velocity.y *= -1;
				this.acceleration.y += 0.01;
			}
			else
			{
				this.acceleration.y *= 0.9;
			}

		}

		if(this.life <= this._fadeDuration &&
			this.life % Math.floor(this._fadeDuration / this._fadeQuality) === 0)
		{
			this.alpha -= 0.25; // triggers recaching!
		}

	},

	draw: function(ctx) {

		ctx.save();

		var center = new Fizz.Point(this.width / 2, this.height / 2);
		var radius = this.height / 2;
		var startAngle = 0;
		var endAngle = Math.PI * 2;

		ctx.beginPath();
		ctx.arc(center.x, center.y, radius, startAngle, endAngle)
		ctx.closePath();

		ctx.fillStyle 	= this._fillStyle.toRGB(true);
		ctx.fill();

		// Post-render wireframe for dev mode

		if(Fizz.getEnv() === 'dev')
		{
			ctx.beginPath();

			ctx.rect(
				0.5,
				0.5,
				this.width * Math.abs(this.scale.x),
				this.height * Math.abs(this.scale.y)
			);

			ctx.closePath();

			ctx.strokeStyle = this.strokeStyle.toRGB(true);

			ctx.stroke();
		}

		ctx.restore();

	},

	clone: function() {
		var clone = new Particle();
		clone.copy(this);
		return clone;
	}

});

// Static class members

Particle.DEFAULT_LIFE = 7500;
Particle.STROKE_STYLE = Fizz.Color.GREEN;

// Public properties

Particle.prototype.exposeProperty("fadeTime");
