import * as Fizz from './lib/fizz/shim';

if(/complete|interactive|loaded/.test(document.readyState))
{
	init();
}
else
{
	window.addEventListener('DOMContentLoaded', init);
}

function init()
{

	Fizz.setEnv('prod');

	const demo = new Fizz.Demo('#canvas');

	// Static configuration

	const CanvasWidth = demo.stage.width;

	const CanvasHeight = demo.stage.height;

	const GenerationLifetime = 1000 / 8;

	const InitialCellLife = GenerationLifetime + 500;

	// Dynamic configuration

	let rowCount;
	let columnCount;
	let cellWidth;
	let cellHeight;
	let nextGenerationState;
	let grid;
	let cells;
	let timeoutId;

	function init(
		resolution)
	{

		if(typeof cancelTimeout !== 'undefined')
		{
			window.cancelTimeout(timeoutId);
		}

		rowCount = CanvasWidth * resolution;
		columnCount = CanvasHeight * resolution;

		cellWidth = Math.floor(CanvasWidth / rowCount);
		cellHeight = Math.floor(CanvasHeight / rowCount);

		nextGenerationState = makeArray(rowCount * columnCount, false);

		// Initializes our cell grid (container)

		grid = new Fizz.DisplayGrid({
			rows: rowCount,
			columns: columnCount,
			cellWidth: cellWidth,
			cellHeight: cellHeight,
		});

		cells = makeCells(
			rowCount * columnCount,
			cellWidth,
			cellHeight,
			InitialCellLife
		);

		grid.addChild(cells);

		demo.pause();

		demo.stage.empty();

		demo.stage.addChild(grid);

		demo.play();

		(function generate() {

			evolve();

			timeoutId = window.setTimeout(generate, GenerationLifetime);

		}());

	}

	function makeArray(
		defaultValue,
		size)
	{

		const array = [];

		for(let i = 0; i < size; i++)
		{
			array.push(defaultValue);
		}

		return array;

	}

	function makeCells(
		count,
		width,
		height,
		maxLife)
	{

		// Generates cells with a randomized start configuration

		const cells = [];

		for(let i = 0; i < count; i++)
		{

			let cell = new Fizz.DisplayEntity({
				size: [width, height],
			});

			cell.caching = true;

			cell.fillStyle = Fizz.Color.BLACK;

			cell.strokeStyle = Fizz.Color.CLEAR;

			cell.life = (Fizz.math.randomInt(2) === 1) ?
				maxLife :
				0;

			cells.push(cell);

		}

		return cells;

	}

	function getNeighborsCount(
		x,
		y)
	{

		// const neighbors = [
		// 	null, null, null,
		// 	null, null, null,
		// 	null, null, null,
		// ];

		const isFirstX = (x === 0);
		const isLastX = (x === (rowCount - 1));
		const isFirstY = (y === 0);
		const isLastY = (y === (columnCount - 1));

		// Collects neighbor (or null) references

		const topLeftNeighbor = grid.childAtCoordinate(x-1, y-1);
		const topMiddleNeighbor = grid.childAtCoordinate(x, y-1);
		const topRightNeighbor = grid.childAtCoordinate(x+1, y-1);

		const middleLeftNeighbor = grid.childAtCoordinate(x-1, y);
		const middleRightNeighbor = grid.childAtCoordinate(x+1, y);

		const bottomLeftNeighbor = grid.childAtCoordinate(x-1, y+1);
		const bottomMiddleNeighbor = grid.childAtCoordinate(x, y+1);
		const bottomRightNeighbor = grid.childAtCoordinate(x+1, y+1);

		let neighborsCount = 0;

		// Checks top left

		if(topLeftNeighbor && topLeftNeighbor.life > 0 && !isFirstY && !isFirstX)
		{
			// neighbors[0] = topLeftNeighbor;
			neighborsCount += 1;
		}

		// Checks top middle

		if(topMiddleNeighbor && topMiddleNeighbor.life > 0 && !isFirstY)
		{
			// neighbors[1] = topMiddleNeighbor;
			neighborsCount += 1;
		}

		// Checks top right

		if(topRightNeighbor && topRightNeighbor.life > 0 && !isFirstY && !isLastX)
		{
			// neighbors[2] = topRightNeighbor;
			neighborsCount += 1;
		}

		// Checks middle left

		if(middleLeftNeighbor && middleLeftNeighbor.life > 0 && !isFirstX)
		{
			// neighbors[3] = middleLeftNeighbor;
			neighborsCount += 1;
		}

		// Checks middle right

		if(middleRightNeighbor && middleRightNeighbor.life > 0 && !isLastX)
		{
			// neighbors[4] = middleRightNeighbor;
			neighborsCount += 1;
		}

		// Checks bottom left

		if(bottomLeftNeighbor && bottomLeftNeighbor.life > 0 && !isLastY && !isFirstX)
		{
			// neighbors[5] = bottomLeftNeighbor;
			neighborsCount += 1;
		}

		// Checks bottom middle

		if(bottomMiddleNeighbor && bottomMiddleNeighbor.life > 0 && !isLastY)
		{
			// neighbors[6] = bottomMiddleNeighbor;
			neighborsCount += 1;
		}

		// Checks bottom right

		if(bottomRightNeighbor && bottomRightNeighbor.life > 0 && !isLastY && !isLastX)
		{
			// neighbors[7] = bottomRightNeighbor;
			neighborsCount += 1;
		}

		// return neighbors.filter((n) => n !== null);
		return neighborsCount;

	}

	function updateNextGenerationState()
	{

		for(let y = 0; y < columnCount; y++)
		{
			for(let x = 0; x < rowCount; x++)
			{

				const cell = grid.childAtCoordinate(x, y);

				const neighborsCount = getNeighborsCount(x, y);

				const index = (y * rowCount) + x;

				// 1. Any live cell with two or three live neighbours survives;
				// 2. Any dead cell with three live neighbours becomes a live cell;
				// 3. All other live cells die in the next generation. Similarly, all other dead cells stay dead;

				let shouldLiveToNextGeneration = (cell.life > 0) ?
					(neighborsCount === 2 || neighborsCount === 3) :
					(neighborsCount === 3);

				// if(Fizz.math.randomInt(24) === 8)
				// {
				// 	shouldLiveToNextGeneration = true;
				// }

				nextGenerationState[index] = shouldLiveToNextGeneration;

			}

		}

	}

	function evolve()
	{

		updateNextGenerationState();

		for(let y = 0; y < columnCount; y++)
		{
			for(let x = 0; x < rowCount; x++)
			{

				const cell = grid.childAtCoordinate(x, y);

				const index = (y * rowCount) + x;

				const shouldLive = nextGenerationState[index];

				cell.life = (shouldLive) ?
					InitialCellLife :
					0;

				if(cell.life > 0)
				{
					cell.exists = true;
				}

			}
		}

	}

	// Initialization

	init(0.125);

	window.setTimeout(init.bind(null, 0.25), 5000);

	window.setTimeout(init.bind(null, 0.5), 10000);

}
