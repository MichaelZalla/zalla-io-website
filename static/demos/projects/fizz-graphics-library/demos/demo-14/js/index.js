window.onload = function() {

	const demo = new Fizz.Demo('#canvas');

	// Load up the spritesheet containing our bitmap tiles

	const NATIVE_TILE_SIZE = 16;

	const tilesheet = new Fizz.Spritesheet({
		source: 'assets/terrain.png',
		frames: {
			width: NATIVE_TILE_SIZE,
			height: NATIVE_TILE_SIZE
		},
		animations: {
			water: [8, 12, 40],
			hero_idle: [30, 31],
			hero_front_walk: [20, 21],
			hero_back_walk: [22, 23],
			hero_side_walk: [28, 29]
		}
	});

	// Create an object that describes our game world

	const WORLD_DATA_STR = '01,01,01,01,01,01,01,01,01,01,01,01,01,01,01,01,01,01,01,01,01,01,26,27,01,01,01,01,01,01,01,01,01,01,01,01,01,01,34,35,01,01,01,01,01,01,01,01,01,01,01,16,17,01,03,03,03,01,01,01,26,27,01,01,01,01,01,24,25,03,03,03,03,03,03,03,34,35,01,01,01,01,01,01,01,03,04,04,03,03,03,03,03,03,01,01,01,01,01,01,01,03,04,04,08,08,08,03,03,03,01,01,01,01,01,01,01,08,04,04,08,08,08,08,08,01,01,01,08,01,01,08,08,08,04,04,08,08,08,08,08,08,08,01,08,08,08,08,08,08,04,04,03,03,08,08,08,08,08,08,08,08,08,08,08,01,03,03,03,01,01,01,01,08,08,08,01,08,08,01,01,01,03,03,03,01,01,01,01,01,01,08,01,01,01,01,01,01,01,03,03,03,01,01,01,01,01,01,01,01,01,01,01,01,01,03,03,03,03,01,01,01,01,01,01,01,01,01,01,01,03,03,03,03,03,03,01,01,01,01,01,01,01,01,01,03,03,03,03,03,03,03,03,01,01,01';

	const WORLD_DATA = WORLD_DATA_STR.split(',');

	const WORLD_COLUMNS = 16;

	const SOLID_TILES = [1,2,8,9,10,11,12,16,17,18,19,24,25,26,27,28,34,35];

	// Create a DisplayGrid large enough to include the whole tile map

	const map = new Fizz.DisplayGrid({
		cellWidth: NATIVE_TILE_SIZE,
		cellHeight: NATIVE_TILE_SIZE,
		rows: WORLD_DATA.length / WORLD_COLUMNS,
		columns: WORLD_COLUMNS
	});

	// Factory functions for making new tiles

	function makeGroundTile(
		tileId)
	{

		return new Fizz.Graphic({
			spritesheet: tilesheet,
			texture: tileId,
			snapToPixel: true
		});

	}

	function isWaterTile(
		tileId)
	{
		const  animation = tilesheet.getAnimation('water');

		return (
			animation.begin <= tileId &&
			tileId <= animation.end
		);
	}

	function makeWaterTile()
	{

		// Generate (animated) water tile

		const tile = new Fizz.Sprite({
			spritesheet: tilesheet,
			animation: 'water',
			snapToPixel: true
		});

		// Randomize the current playback position

		tile.texture += Fizz.math.randomInt(4);

		tile._timeUntilTransition += Fizz.math.randomInt(100);

		return tile;
	}

	// Function to rebuild the map (tile container) based on the world data

	function rebuildMap()
	{

		map.empty();

		// Populate the map (grid) based on the world data

		WORLD_DATA.foreach((tileId) => {

			tileId = parseInt(tileId);

			var tile = (isWaterTile(tileId)) ?
				makeWaterTile() :
				makeGroundTile(tileId);

			map.addChild(tile);

		});

	}

	// Intial map build

	rebuildMap();

	function tileAtPosition(
		x,
		y)
	{
		return map.childAtCoordinate(
			Math.floor(x/map.columns),
			Math.floor(y/map.rows)
		);
	}

	function tileAtPositionIsSolid(
		x,
		y)
	{
		var tile = tileAtPosition(x, y);

		return (tile === null) || SOLID_TILES.indexOf(tile.texture) > -1;
	}

	var Hero = Fizz.Sprite.extend({

		init: function(settings) {

			settings.assign({
				spritesheet: tilesheet,
				snapToPixel: true
			});

			Fizz.Sprite.prototype.init.call(this, settings);

			this.scaleX = 0.9;
			this.scaleY = 0.9;

			this.walkingSpeed = 2;

			this.walkCycleSpeed = this.walkingSpeed * 250;
			this.idleCycleSpeed = 12;

			this.spritesheet.getAnimation('hero_idle').speed = this.idleCycleSpeed;
			this.spritesheet.getAnimation('hero_front_walk').speed = this.walkCycleSpeed;
			this.spritesheet.getAnimation('hero_back_walk').speed = this.walkCycleSpeed;
			this.spritesheet.getAnimation('hero_side_walk').speed = this.walkCycleSpeed;

			// Set initial animation state

			this.setFacing(Hero.FACING_DOWN);

			this.idle();

		},

		update: function(deltaT) {

			Fizz.Sprite.prototype.update.call(this, deltaT);

			// Figure out where the hero would have walked
			var newX = this.x,
				newY = this.y;

			// Revert position changes made by superclass update method(s)
			this.x -= this.velocity.x;
			this.y -= this.velocity.y;

			// Less computation necessary if we exit for each collision

			// Top left
			if(tileAtPositionIsSolid(newX, newY + this.height / 2))
			{
				this.stop(); return;
			}

			// Top right
			if(tileAtPositionIsSolid(newX + this.width, newY + this.height / 2))
			{
				this.stop(); return;
			}

			// Bottom left
			if(tileAtPositionIsSolid(newX, newY + this.height))
			{
				this.stop(); return;
			}

			// Bottom right
			if(tileAtPositionIsSolid(newX + this.width, newY + this.height))
			{
				this.stop(); return;
			}

			// The move is valid, so let the hero move

			this.x += this.velocity.x;
			this.y += this.velocity.y;

			// Unlock any nearby chests (by walking up to them)

			if(tileAtPosition(this.x, this.y).texture == 34)
			{
				tileAtPosition(this.x, this.y - this.height).texture = 18;
				tileAtPosition(this.x + this.width, this.y - this.height).texture = 19;
			}

			if(tileAtPosition(this.x, this.y).texture == 35)
			{
				tileAtPosition(this.x, this.y - this.height).texture = 19;
				tileAtPosition(this.x - this.width, this.y - this.height).texture = 18;
			}

		},

		setFacing: function(facing) {

			this.facing = facing;

			switch(this.facing) {

				case Hero.FACING_UP:
					this.scaleX = Math.abs(this.scaleX);
					this.gotoAndPlay('hero_back_walk');
					break;

				case Hero.FACING_DOWN:
					this.scaleX = Math.abs(this.scaleX);
					this.gotoAndPlay('hero_front_walk');
					break;

				case Hero.FACING_RIGHT:
					this.scaleX = Math.abs(this.scaleX);
					this.gotoAndPlay('hero_side_walk');
					break;

				case Hero.FACING_LEFT:
					this.scaleX = Math.abs(this.scaleX) * -1;
					this.gotoAndPlay('hero_side_walk');
					break;
			}

		},

		idle: function() {

			this.velocity.x = this.velocity.y = 0;
			this.gotoAndStop('hero_idle');
			this.play();

		},

		walk: function() {

			switch(this.facing) {

				case Hero.FACING_UP:
					this.velocity.x = 0;
					this.velocity.y = -this.walkingSpeed;
					break;

				case Hero.FACING_DOWN:
					this.velocity.x = 0;
					this.velocity.y = this.walkingSpeed;
					break;

				case Hero.FACING_LEFT:
					this.velocity.x = -this.walkingSpeed;
					this.velocity.y = 0;
					break;

				case Hero.FACING_RIGHT:
					this.velocity.x = this.walkingSpeed;
					this.velocity.y = 0;
					break;

			}

		}

	});

	Hero.FACING_UP = 0;
	Hero.FACING_RIGHT = 1;
	Hero.FACING_DOWN = 2;
	Hero.FACING_LEFT = 3;

	var hero = new Hero({
		position: new Fizz.Point(8 * NATIVE_TILE_SIZE, 14 * NATIVE_TILE_SIZE),
	});

	var visibility = 96;

	var directionBias = 16;

	function updateMapWithCoolLighting(
		deltaT)
	{

		Fizz.DisplayGrid.prototype.update.call(this, deltaT);

		var heroCenterPoint = new Fizz.Point(hero.position.x + hero.width / 2, hero.position.y);// + hero.height / 2);

		if(hero.facing === Hero.FACING_UP)
		{
			heroCenterPoint.y -= directionBias;
		}
		else if(hero.facing === Hero.FACING_DOWN)
		{
			heroCenterPoint.y += directionBias;
		}
		else if(hero.facing === Hero.FACING_LEFT)
		{
			heroCenterPoint.x -= directionBias;
		}
		else if(hero.facing === Hero.FACING_RIGHT)
		{
			heroCenterPoint.x += directionBias;
		}

		var compTilePosition = new Fizz.Point();

		for(var row = 0; row < this.rows; row++)
		{

			for(var col = 0; col < this.columns; col++)
			{

				compTilePosition.x = this.x + col * NATIVE_TILE_SIZE;
				compTilePosition.y = this.y + row * NATIVE_TILE_SIZE;

				var proximity = compTilePosition.distanceFrom(heroCenterPoint);

				var luminance = Fizz.math.mapToDomain([-1, -0.25], [NATIVE_TILE_SIZE, visibility], proximity) * -1;

				var tile = this.childAtCoordinate(col, row);

				if(isWaterTile(tile.texture)) luminance *= 0.4;

				tile.alpha = luminance;

			}

		}

	}

	map.update = updateMapWithCoolLighting;

	var inputs = {
		KEY_ARROW_UP: 38,
		KEY_ARROW_DOWN: 40,
		KEY_ARROW_LEFT: 37,
		KEY_ARROW_RIGHT: 39,
	};

	var keyPressed = false;

	demo.stage.on('keydown', (e) => {

		if(!keyPressed && keyPressed !== e.keyCode)
		{

			keyPressed = e.keyCode;

			switch(e.keyCode)
			{

				case inputs.KEY_ARROW_UP:
					hero.setFacing(Hero.FACING_UP);
					hero.walk();
					break;

				case inputs.KEY_ARROW_DOWN:
					hero.setFacing(Hero.FACING_DOWN);
					hero.walk();
					break;

				case inputs.KEY_ARROW_LEFT:
					hero.setFacing(Hero.FACING_LEFT);
					hero.walk();
					break;

				case inputs.KEY_ARROW_RIGHT:
					hero.setFacing(Hero.FACING_RIGHT);
					hero.walk();
					break;
			}

		}

	});

	demo.stage.on('keyup', (e) => {
		keyPressed = false;
		hero.idle();
	});

	// Add the tile map and hero to the stage so they will be rendered

	demo.stage.addChild(map);

	demo.stage.addChild(hero);

	// Press 'Enter' to toggle dev mode

	demo.stage.on('keydown', (e) => {
		if(e.keyCode === 13)
		{
			Fizz.setEnv((Fizz.getEnv() === 'dev') ? 'prod' : 'dev');
		}
	});

	window.hero = hero;

	const ELEM_SCALE = 2;

	// Handle CSS scaling dynamically
	const canvas = window.document.getElementById("canvas");

	canvas.style.width = canvas.getAttribute('width') * ELEM_SCALE + 'px';
	canvas.style.height = canvas.getAttribute('height') * ELEM_SCALE + 'px';

};
