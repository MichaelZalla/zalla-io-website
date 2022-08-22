+++
slug = "ink-blit"
title = "ink-blit"
description = ""
year = "2022"
season = "summer"
technologies = [
  "TypeScript",
  "Node.js",
  "React",
  "ink",
  "generate-react-cli",
]
swatch = "#FF7632"
repository = "https://github.com/MichaelZalla/ink-blit"
hasDemo = true
demo_url = ""
disqus_identifier = "ink-blit"
disqus_title = "ink-blit"
+++

Ink-blit is a tiny game development library designed for making native command-line games with JavaScript. The library builds on top of Vadim Demedes' popular [Ink](https://github.com/vadimdemedes/ink) framework; through a small set of React components and hooks, `ink-blit` provide a simple API for initializing, updating, and rendering games in real-time. {{< read-more-button >}}

## Motivation

When I first heard about Ink, I was intrigued by the idea of using a React component model to write command-line tools. This project was motivated in part by my wanting to play with Ink and learn its core API. Developers have used Ink to create new [automated test-runners](https://github.com/oblador/loki), [project generators](https://github.com/segmentio/typewriter), and tools for [third-party cloud services](https://github.com/cloudflare/wrangler2)—proving Ink's value in the process.

In the realm of graphics and games, Ink's [README](https://github.com/vadimdemedes/ink#whos-using-ink) does feature a [Minesweeper game](https://github.com/mordv/mnswpr), and even a [Wordle clone](https://github.com/jrr/inkle). Despite these contributions, Ink still presents plenty of opportunity to bring more classic games to the command line. The simplicity of text-based games, and text-based graphics, lends itself well to the novice game programmer who wants a quick path to writing game logic and drawing something 2-dimensional to the screen.

The simple input and output models inherent to these games also make them excellent candidates for research in artificial intelligence, machine learning, and genetic algorithms. Engineers can apply reinforcement learning techniques to train models to [consistently win at 2D games](https://www.nature.com/articles/nature14236)—even when those models are given nothing but [raw pixel representations](https://karpathy.github.io/2016/05/31/rl/). The [OpenAI Gym](https://github.com/openai/gym) project is developing a standard interface between learning models and the environments (or games) in which they operate. [Lunar Lander](https://www.gymlibrary.ml/environments/box2d/lunar_lander/) is one such environment that could easily be represented in a terminal. Newer training platforms like [TensorFlow.js](https://www.tensorflow.org/js) allow training programs to run on top of Node (and thus interface with Ink-based games).

I also took particular inspiration from the YouTube video, [*Neural Network Learns to Play Snake*](https://www.youtube.com/watch?v=zIkBYwdkuTk).

## Design Approach

The `ink-blit` library was designed with simplicity in mind. Individual games and demos are defined as standalone React components. The library follows a "convention over configuration" approach, wherein each game is responsible for its own internal game-state representation, input handling, updates, rendering, and exit conditions. Games may share similar state (models), input-processing code, etc, and game authors are free to create their own generic functions and utilities to minimize code-duplication across games.

The library itself provides only a few essential constructs that would be useful to almost any command-line game:

### 1. Higher-order containers

Several container components—including `App` and `FullScreen`—provide a sandbox layer between the terminal and your game. These components allow game authors to spend less time on "*how* to render" and "*where* to render", and more time on "*what* to render":

```tsx
<App>
  <PongGame />
</App>
```

Games render their frame (text) data to a `TextBuffer`—a named type for `string[][]`. Buffers can be passed to a `ScreenBuffer` component, which translates the buffer into a set of Ink `Text` components that are rendered to the terminal screen:

```tsx
const PongGame = () => {
  ...
  return (
    <Box data-testid="PongGame">
      <ScreenBuffer buffer={buffer} />
    </Box>
  )
}
```

Using a `ScreenBuffer` to output a frame to the screen is just one example of convention-over-configuration; each game maintains full control over what text reaches the screen, and how.

### 2. Callback loops

Almost every game will involve an “update" function and a "render" (or draw) function. Together, these functions allow a user to respond to a previous game state (i.e., via keyboard input), and allow the game to update its entities (or other state) and ultimately draw a new representation to the screen. These functions are called in a loop until some exit condition is met.

The library provides a `useGame()` hook, which a game can use to quickly establish this loop:

```tsx
const PongGame = () => {

  const update = (input: GameInput) => {...}
  const render = (buffer: TextBuffer) => {...}
  const tickRate = 24 // ticks (and frames) per second

  const [_, buffer] = useGame({ update, render, tickRate })

  return (
    <Box data-testid="PongGame">
      <ScreenBuffer buffer={buffer} />
    </Box>
  )

}
```

<!-- Tick rates can be customized to achieve a desired effect. -->

### 3. Sizing information

The library provides a `useTerminalDimensions()` hook, which tracks the current terminal size. This hook leverages the fact that, in the NodeJS runtime, the `stdout` stream is an instance of `EventEmitter` and will emit `'resize'` events whenever the terminal size changes:

```tsx
function onResize() {
  let { columns, row } = stdout
  setDimensions({ columns, row })
}
```

Other hooks and components can use this hook to keep track of dimensions:

```tsx
const dimensions = useTerminalDimensions()
```

The `FullScreen` component provides a `FullScreenContext`, which receives the result of this hook, making it available to the underlying game component:

```tsx
<FullScreenContext.Provider value={{
  width: dimensions.columns,
  height: dimensions.rows }}>
  {children}
</FullScreenContext.Provider>
```

A game can use this information to dynamically resize its game world to fit the screen.

<!-- ```tsx
const useGame = (...) =>
{

  const fullScreenDimensions =
    React.useContext<FullScreenContextProviderValue>(FullScreenContext);

  const [frameBufferDimensions, setFrameBufferDimensions] =
    React.useState<Dimensions>({
      width: fullScreenDimensions.width - 2, // accounts for horizontal padding
      height: fullScreenDimensions.height - 2, // accounts for vertical padding
    })

  React.useEffect(
    () => {

      // Account for <FullScreen> borders

      setFrameBufferDimensions({
        width: fullScreenDimensions.width - 2,
        height: fullScreenDimensions.height - 2,
      })

    },
    [
      fullScreenDimensions,
      setFrameBufferDimensions,
    ]
  )

}
``` -->
### 4. Semantic types

Games that take keyboard input and render text-based (or ASCII) graphics commonly deal with similar data types; `ink-blit` offers some predefined types for convenience, including:

- `Buffer`
- `Dimensions`
- `Direction`
- `Coordinate`

Game authors can compose common types when defining complex types for their game state; for instance, a `Tetromino` in Tetris might be defined using `Coordinate`, like so:

```tsx
type Tetromino = {
  type: TetrominoType,
  position: Coordinate,
  cells: Coordinate[],
}
```

The `Direction` enum is useful for distinguishing different movement operations—such as moving a piece horizontally in *Tetris*—as well as for tracking entity orientations—such as the direction of movement in *Snake*:

```tsx
switch(nextDirection)
{
  case Direction.Up:
    newHead.y -= 1
    break;
  case Direction.Down:
    newHead.y += 1
    break;
  case Direction.Left:
    newHead.x -= 1
    break;
  case Direction.Right:
    newHead.x += 1
    break;
}
```

## Game Architecture

As stated earlier, a game is simply a React component that outputs text. This means that game authors may set up their games however they wish—making use of as much or as little of the library as they'd like.

### Representing game state

For most games, current state can be represented using a basic JavaScript object. In the `Pong` example (below), the `GameState` type is defined as follows:

```tsx
type GameState = {
  dimensions: Dimensions;
  ball: Coordinate;
  ballVelocity: Coordinate;
  paddles: [Coordinate, Coordinate];
  paddleHeight: number;
  didFinishPlay: boolean;
  frame: number;
  score: number;
  settings: GameSettings;
}
```

Here, `GameState` tracks several dynamic values, including the position and velocity of the ball, the position of the paddles, as well as a `didFinishPlay` flag (which the `update` function can set, signaling that a game has ended).

In the case of *Pong*, it also stores a reference to a `GameSettings` object, which holds parameters such as the height of each paddle—a sort of "difficulty" parameter:

```tsx
type GameSettings = {
  paddleHeight: number;
}
```

Some pieces of game state may be found commonly across different games. For example, the games *Pong*, *Snake*, and *Tetris* might each maintain a `score`, as well as the current `dimensions`. Despite these shared examples, `ink-blit` makes no assumptions about the specific pieces that a game may track.

Conventionally, the current game state is defined with `React.useState()`:

```tsx
const [gameState, setGameState] = React.useState<GameState>(
  makeGameState(dimensions) // generates a new, beginning game state
)

...

const makeGameState = (
  dimensions: Dimensions,
  settings: GameSettings = DefaultGameSettings): GameState =>
{
  return {
    dimensions,
    settings,
    snake: ...,
    fruit: ...,
    direction: ...,
    didCollide: false,
    frame: 1,
    score: 0,
  }
}
```

### User input and game updates

Internally, `useGame()` maintains a `gameInput` state—a piece of React state that is updated whenever new keyboard input is received through Ink's [`useInput()` hook](https://github.com/vadimdemedes/ink#useinputinputhandler-options):

```tsx
export type GameInput = {
  char: string|null;
  key: Key|null;
}
```

This input object is passed as-is into the game's `update` callback whenever it is called:

```tsx
const update = (input: GameInput) => {
  if(input.key?.escape) {
    exit()
  }
  // Apply user input to game state...
})
```

In the *Snake* example below, `update()` delegates most of the update logic to a stateless `applyInput()` function:

```tsx
const update = React.useCallback(
  (input: GameInput) => {

    // Delegates game logic to `applyInput()`
    let nextGameState: GameState = applyInput(gameState, input, exit)

    // Resets the game if the snake collided with a wall, or with itself
    if(nextGameState.didCollide) {
      nextGameState = resetGameState(gameState)
    }

    // Advances the game state
    setGameState(nextGameState)

  },
  [exit]
)
```

After user input is applied and the next game state is generated, the game's `update()` callback is responsible for calling `setGameState()` with the new game state.

### Frame rendering

The `useGame()` hook also maintains a `TextBuffer`, which is dynamically allocated according to the current terminal size:

```tsx
const [screenBuffer, setScreenBuffer] = React.useState<TextBuffer>([])
```

Inside of the `useGame()` game loop, this buffer is updated to hold the next frame (as generated by the game's `render()` callback):

```tsx
const emptyFrame = getEmptyFrameBuffer(frameBufferDimensions)

const nextFrame = options.render(emptyFrame)

setScreenBuffer(nextFrame)
```

The `useGame()` hook returns this buffer as part of its result, so games using the hook do not need to maintain their own reference or copy. Games can simply write to the `buffer` passed to its `render()` callback, and trust that the buffer returned by `useGame()` will always hold the newest frame:

```tsx
const render = (buffer: TextBuffer) => {

  // Renders snake
  for(let i = 0; i < state.snake.length; i++) {
    buffer[state.snake[i]!.y]![state.snake[i]!.x] = `@`
  }

  // Renders fruit...

}

...

const [_, buffer] = useGame({ update, render, tickRate })
```

### Game wrappers

A minimal Ink scaffolding can be used to bring each game to life on the command line:

```tsx
// ./examples/pong/cli.tsx

import React from 'react';
import { render } from 'ink';

import App from '../../src/components/App/App';
import PongGame from './components/PongGame/PongGame';

const { clear, waitUntilExit } = render(
  <App>
    <PongGame />
  </App>
);

waitUntilExit().then(clear)
```

In the example above, `PongGame` is wrapped in an `App`, which `ink-blit` provides. This container component enables a "full-screen" mode for play—switching your terminal to an [alternate screen buffer](https://terminalguide.namepad.de/mode/p47/) for the lifetime of the program, and then switching back to your normal terminal session. Internally, `App` uses two independent components: `AltScreen` and `FullScreen`. Combining these components achieves a game experience similar to running a game in a separate terminal.

<!-- Games can leverage Ink's `useApp()` React hook to retrieve an `exit()` callback; calling this callback from within its game loop, a game can terminate its process (e.g., according to some keyboard input). -->

## Example Games

The `ink-blit` repository currently includes 2 working examples of classic games. I'll likely add more examples to the repository as time permits.

### [examples/pong](https://github.com/MichaelZalla/ink-blit/tree/main/examples/pong)

The player uses the *Up* and *Down* arrow keys to control the position of their paddle, doing their best to return the ball against an aggressive bot.

### [examples/snake](https://github.com/MichaelZalla/ink-blit/tree/main/examples/snake)

The player controls a 2D snake, avoiding both itself and walls while collecting as much food as it can to achieve a higher score.

### [examples/_template](https://github.com/MichaelZalla/ink-blit/tree/main/examples/_template)

Contains a template component that game authors can use as a starting point for a game.

## Areas for improvement

The library still has plenty of room for improvement. Below are some examples:

1. Expanding `TextBuffer` to store color information; this would allow game authors to enhance their game representations with colored text and backgrounds, using Ink's built-in `color` component props, or with an abstraction like [`ink-color-pipe`](https://github.com/LitoMore/ink-color-pipe).
2. Separating the `update()` loop from the `render()` loop; this would allow game authors to create turn-based (or otherwise non-real-time) games, where `update()` is called explicitly in response to some asynchronous user input, instead of being called automatically inside a timed game loop.
3. Expanding `UseGameHookOptions` to accept additional options. This could allow game authors to opt-in to common game behaviors, allowing `useGame()` to handle the implementation. These behaviors could include (a) tracking and rendering a frame count, and (b) terminating the program when the user presses *Escape*.
