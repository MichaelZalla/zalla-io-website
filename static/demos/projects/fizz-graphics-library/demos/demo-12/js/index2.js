(function() {

	var Tilemap = Fizz.DisplayGrid.extend({

		init: function(settings) {

			this.tilesheet = null;

			Fizz.DisplayGrid.prototype.init.call(this);

			if(typeof settings === "object" && settings !== null) {
				this.assign(settings);
			}

			for(var col = 0; col < this.columns; col++) {
				for(var row = 0; row < this.rows; row++) {
					
					this.addChild(new Fizz.Graphic({
						'spritesheet': this.tilesheet,
						'texture': Tilemap.DEFAULT_TILE_ID
					}));

				}
			}

		},

		getTileAt: function(coordinate) {

			return this.childAtCoordinate.apply(this, [coordinate.x, coordinate.y]);

		},

		setTileAt: function(coordinate, tileId) {
		
			var tile = this.getTileAt(coordinate);

			if(tile) { tile.texture = tileId; }

		}

	});

	Tilemap.DEFAULT_TILE_ID = 0;

	/* =================================================================== */

	var demo = new Fizz.Demo('#canvas');

	/*
	var WORLD_DATA = [

		0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,
		0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,
		0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,
		0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,

		0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,
		0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,
		0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,
		0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,

		0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,
		0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,
		0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0,
		0, 0, 0, 0,  0, 0, 0, 0,  0, 0, 0, 0

	];
	*/
	
	var TILE_SIZE = 16;

	var terrain = new Fizz.Spritesheet({
		'source': 'assets/terrain.png',
		'frames': {
			'width': TILE_SIZE,
			'height': TILE_SIZE
		}
	});

	var tilemap = new Tilemap({
		'rows': 12,
		'columns': 12,
		'cellWidth': TILE_SIZE,
		'cellHeight': TILE_SIZE,
		'tilesheet': terrain
	});


	function getTileData(col, row) {
		
		if(row < 0 || row >= 12 || col < 0 || col >= 12) return;
		
		return parseInt(WORLD_DATA[row * 12 + col]);

	}

	function setTileData(col, row, tileID) {
		
		if(row < 0 || row >= 12 || col < 0 || col >= 12) return;
		
		WORLD_DATA[row * 12 + col] = tileID;

	}

	function isValidCoordinate(coord) {
		return !(coord.x < 0 || coord.x >= 12 || coord.y < 0 || coord.y >= 12);
	}

	function isValidPathCoordinate(coord) {
		return isValidCoordinate(coord) &&
			(getTileData(coord.x, coord.y) !== SOLID); // stone
	}

	function clearTileDistances(tileData) {
		for(var i = 0; i < tileData.length; i++) {
			if(tileData[i] != SOLID) {
				tileData[i] = UNREACHABLE;
			}
		}
	}

	function setTileDistances(tileData, targetCoordinate) {

		// Use a multi-dimensional array of flags (because Array.prototype.indexOf is dumb...)

		var visited = new Array(12 * 12),
			visitedCount = 0;

		var frontier = [targetCoordinate],
			level = 0;

		function frontierHasCoordinate(coord) {
			var hasCoord;
			frontier.foreach(function(c) {
				if(c.x === coord.x && c.y === coord.y) {
					hasCoord = true;
				}
			});
			return hasCoord;
		}

		while(visitedCount < visited.length && level < 32) {

			var frontierSize = frontier.length;

			for(i = 0; i < frontierSize; i++) {

				var tile = frontier[i];
				
				// Mark the coordinate's distance from the target

				// setTileData(tile.x, tile.y, level);

				// Mark the coordinate a 'visited'

				visited[tile.y * 12 + tile.x] = true;
				
				visitedCount++;

				// Lastly, add any new neighboring tiles to the frontier

				var left 	= new Fizz.Point(tile.x - 1, tile.y),
					right 	= new Fizz.Point(tile.x + 1, tile.y),
					top 	= new Fizz.Point(tile.x, tile.y - 1),
					btm 	= new Fizz.Point(tile.x, tile.y + 1);

				[left, right, top, btm].foreach(function(coord) {

					var index = coord.y * 12 + coord.x;
					
					if(visited[index]) return;
					if(!isValidPathCoordinate(coord)) return;
					if(frontierHasCoordinate(coord)) return;

					frontier.push(coord);

				});

			}

			// Remove any visited coordinates from the frontier

			frontier.splice(0, frontierSize);

			// Increase the distance level for subsequent tile visits

			level += 1;

		}

	}

	function updateTilemapAppearance() {

		// Update the tilemap based on the world data
		WORLD_DATA.foreach(function(tileID) {
			tilemap.setTileAt(tileID);
		});

	}

	function positionToCoordinate(position) {
		return new Fizz.Point(
			Math.floor((position.x - tilemap.x) / TILE_SIZE),
			Math.floor((position.y - tilemap.y) / TILE_SIZE)
		);
	}

	function toggleSolidTile(coord) {

		var id = tilemap.getTileAt(coordinate);

		tilemap.setTile(coord, (id === SOLID) ? NON_SOLID : SOLID);

	}

	demo.stage.on('mousedown', function(e) {

		var mousePos = new Fizz.Point(e.mouseX, e.mouseY);
		
		if(tilemap.intersects(mousePos)) {
			
			var coord = positionToCoordinate(mousePos)
			
			toggleSolidTile(coord);

			// Recalculate all paths to the target

			// clearTileDistances(WORLD_DATA);
			
			// toggleSolidTile(positionToCoordinate(mousePos));
			
			// setTileDistances(WORLD_DATA, new Fizz.Point(0, 11)); // target

			// Update the world representation
			
			// updateTilemapAppearance();


			if(id === SOLID) {

			} else {

			}

			tilemap.setTileAt(, SOLID);

		}

	});

	// Set an initial target and render the world (tilemap)
	
	// setTileDistances(WORLD_DATA, new Fizz.Point(0, 11));
	
	// updateTilemapAppearance();

	// Render the world on stage
	demo.stage.addChild(tilemap);

})();