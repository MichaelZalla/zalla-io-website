$(function() {

	const demo = new Fizz.Demo('#canvas');

	demo.stage.on('keyup', function(e) {
		if(e.keyCode === 13)
		{
			Fizz.setEnv((Fizz.getEnv() === 'dev') ? 'prod' : 'dev');
		}
	});

	var TILE_SIZE = 16;

	var tilesheet = new Fizz.Spritesheet({
		source: 'assets/tiles.png',
		frames: {
			width: TILE_SIZE,
			height: TILE_SIZE,
		},
	});

	var terrain = new Fizz.Spritesheet({
		source: 'assets/terrain.png',
		frames: {
			width: TILE_SIZE,
			height: TILE_SIZE,
		},
	});

	var world = new Fizz.DisplayGrid({
		rows: 12,
		columns: 12,
		cellWidth: TILE_SIZE,
		cellHeight: TILE_SIZE,
	});

	var WORLD_DATA = window.WORLD_DATA = [99,99,99,99,99,99,99,99,99,99,99,24,99,17,16,17,99,17,18,19,99,21,22,23,99,99,15,99,15,16,99,20,21,20,21,99,99,15,14,13,14,99,22,21,99,19,20,99,99,16,99,12,99,14,99,99,17,18,19,99,99,99,10,11,12,13,14,15,16,99,20,99,99,8,9,99,13,99,15,16,99,22,21,99,99,7,99,15,14,15,99,17,99,99,22,99,99,6,5,99,15,99,19,18,99,24,23,99,99,99,4,5,99,23,99,19,99,99,24,99,1,2,3,99,23,22,21,20,21,22,23,99,0,99,99,99,99,99,99,99,99,99,99,99];

	var SOLID_TILE = 99;

	var UNREACHABLE = Infinity;

	function getTileData(
		col,
		row)
	{

		if(row < 0 || row >= 12 || col < 0 || col >= 12)
		{
			return null;
		}

		return parseInt(WORLD_DATA[row * 12 + col]);

	}

	function setTileData(
		col,
		row,
		tileID)
	{

		if(row < 0 || row >= 12 || col < 0 || col >= 12)
		{
			return null;
		}

		WORLD_DATA[row * 12 + col] = tileID;

	}

	function isValidCoordinate(
		coord)
	{
		return !(coord.x < 0 || coord.x >= 12 || coord.y < 0 || coord.y >= 12);
	}

	function isValidPathCoordinate(
		coord)
	{

		if(!isValidCoordinate(coord))
		{
			return false;
		}

		var data = getTileData(coord.x, coord.y);

		if(data === SOLID_TILE)
		{
			return false;
		}

		if(data === UNREACHABLE)
		{
			return false;
		}

		return true;

	}

	function clearTileDistances(tileData)
	{
		for(var i = 0; i < tileData.length; i++)
		{
			if(tileData[i] != SOLID_TILE)
			{
				tileData[i] = UNREACHABLE;
			}
		}
	}

	function setTileDistances(
		tileData,
		targetCoordinate)
	{

		// Use a multi-dimensional array of flags (because Array.prototype.indexOf is dumb...)

		var visited = new Array(12 * 12);
		var visitedCount = 0;

		var frontier = [
			targetCoordinate
		];

		var level = 0;

		function frontierHasCoordinate(
			coord)
		{

			var hasCoord;

			frontier.foreach((c) => {
				if(c.x === coord.x && c.y === coord.y)
				{
					hasCoord = true;
				}
			});

			return hasCoord;

		}

		while(visitedCount < visited.length && level < 32)
		{

			var frontierSize = frontier.length;

			for(i = 0; i < frontierSize; i++)
			{

				var tile = frontier[i];

				// Mark the coordinate's distance from the target

				setTileData(tile.x, tile.y, level);

				// Mark the coordinate a 'visited'

				visited[tile.y * 12 + tile.x] = true;

				visitedCount++;

				// Lastly, add any new neighboring tiles to the frontier

				var left = new Fizz.Point(tile.x - 1, tile.y),
					right = new Fizz.Point(tile.x + 1, tile.y),
					top = new Fizz.Point(tile.x, tile.y - 1),
					btm = new Fizz.Point(tile.x, tile.y + 1);

				[left, right, top, btm].foreach((coord) => {

					var index = coord.y * 12 + coord.x;

					if(visited[index])
					{
						return;
					}

					if(!isValidPathCoordinate(coord))
					{
						return;
					}

					if(frontierHasCoordinate(coord))
					{
						return;
					}

					frontier.push(coord);

				});

			}

			// Remove any visited coordinates from the frontier

			frontier.splice(0, frontierSize);

			// Increase the distance level for subsequent tile visits

			level += 1;

		}

	}

	function rebuildWorld()
	{

		// Remove old world tiles

		world.empty();

		// Populate our world (grid) based on the world data

		WORLD_DATA.foreach((tileID) => {

			switch(tileID)
			{

				case UNREACHABLE:

					world.addChild(new Fizz.Graphic({
						'spritesheet': tilesheet,
						'texture': 0
					}));

					break;

				case SOLID_TILE:

					world.addChild(new Fizz.Graphic({
						'spritesheet': terrain,
						'texture': 4
					}));

					break;

				default:

					world.addChild(new Fizz.Graphic({
						'spritesheet': terrain,
						'texture': 3
					}));

			}

		});

	}

	function positionToCoordinate(
		position)
	{
		return new Fizz.Point(
			Math.floor((position.x - world.x) / TILE_SIZE),
			Math.floor((position.y - world.y) / TILE_SIZE)
		);
	}
	/*
	function toggleSolidTile(
		coord)
	{

		if(getTileData(coord.x, coord.y) === SOLID_TILE)
		{
			setTileData(coord.x, coord.y, 0);
		}
		else
		{
			setTileData(coord.x, coord.y, SOLID_TILE);
		}

	}
	*/
	demo.stage.on('mousedown', (e) => {

		var mousePos = new Fizz.Point(e.mouseX, e.mouseY);

		if(world.intersects(mousePos))
		{

			var mouseCoord = positionToCoordinate(mousePos);

			if(isValidPathCoordinate(mouseCoord))
			{

				clearTileDistances(WORLD_DATA);

				// Recalculate all paths to the new target coordinate
				setTileDistances(WORLD_DATA, mouseCoord);

				// Update the world representation
				rebuildWorld();

			}

		}

	});

	// Initial world build

	setTileDistances(WORLD_DATA, new Fizz.Point(0, 11));

	rebuildWorld();

	// Render the world on stage

	demo.stage.addChild(world);

	var Bot = Fizz.Graphic.extend({

		init: function(settings) {

			this._speed = 6;

			Fizz.Graphic.prototype.init.call(this);

			this.size.x = 14;
			this.size.y = 14;

			this.snapToPixel = true;
			this.fillStyle = Fizz.Color.CYAN;

			if(typeof settings === "object" && settings !== null)
			{
				this.assign(settings);
			}

		},

		update: function(deltaT) {

			var offset = TILE_SIZE / 2;

			var centerPoint = new Fizz.Point(this.x + this.width/2, this.y + this.height/2);

			var currentPos = positionToCoordinate(centerPoint);
			var currentDist = getTileData(currentPos.x, currentPos.y) || 0;

			if(currentDist === 0)
			{
				return;
			}

			var left = new Fizz.Point(currentPos.x - 1, currentPos.y);
			var right = new Fizz.Point(currentPos.x + 1, currentPos.y);
			var up = new Fizz.Point(currentPos.x, currentPos.y - 1);
			var down = new Fizz.Point(currentPos.x, currentPos.y + 1);

			var valid = [left, right, up, down].filter(function(coord) {
				return isValidPathCoordinate(coord);
			});

			valid.foreach(function(opt) {
				world.childAtCoordinate(opt.x, opt.y).alpha = 0.5;
			});

			if(valid.length === 0)
			{
				return;
			}

			var choice = valid.reduce(function(prev, next) {

				var prevDist = (prev) ? getTileData(prev.x, prev.y) : Infinity,
					nextDist = getTileData(next.x, next.y);

				return (prevDist <= nextDist) ? prev : next;

			});

			//@TODO Tweak movement code to keep the bot within cell boundaries

			this.x += (choice.x - currentPos.x) * this._speed;
			this.y += (choice.y - currentPos.y) * this._speed;

		}

	});

	var bot = new Bot({
		x: TILE_SIZE * 11.5,
		y: TILE_SIZE * 0.5,
	});

	demo.stage.addChild(bot);

	var ELEM_SCALE = 2;

	// Handle CSS scaling dynamically
	var canvas = window.document.getElementById("canvas");
		canvas.style.width = canvas.getAttribute('width') * ELEM_SCALE + 'px';
		canvas.style.height = canvas.getAttribute('height') * ELEM_SCALE + 'px';

});
