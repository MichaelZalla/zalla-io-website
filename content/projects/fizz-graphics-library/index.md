+++
title = "Fizz Graphics Library"
description = "Cillum anim sunt excepteur nostrud elit cupidatat."
year = "2014"
season = "spring"
technologies = [
  "JavaScript",
  "HTML5 Canvas",
  "Jasmine"
]
repository = "https://github.com/MichaelZalla/Fizz"
hasDemo = true
swatch = "#8C6E00"
+++

Fizz is a client-side JavaScript library that leverages the HTML5 [Canvas API](https://developer.mozilla.org/en-US/docs/Web/HTML/Canvas) to help users create interactive scenes, games, and graphics demos—with minimal effort. Fizz has no external dependencies. {{< read-more-button >}}

Fizz was the result of my own desire to help make graphics programming more approachable to the non-programmer. The library takes multiple design cues from the Adobe Flash display-list [rendering model](https://help.adobe.com/en_US/as3/dev/WS5b3ccc516d4fbf351e63e3d118a9b90204-7e58.html), while providing a collection of straightforward, minimal APIs that simplify and accelerate the process of making games and other interactive art.

Features of the library include:

- The `Point`, `Rectangle`, and `Entity` classes, which define transient, spatial entities that interact in a scene.
- The `Event` and `EventEmitter` classes, which set up Fizz's hierarchical event system.
- The `DisplayEntity`, `Graphic`, `Sprite`, and `Spritesheet` classes, whose APIs allow a user to draw static and animated entities in a scene.
- The `Fontsheet` and `Textbox` classes, which build on top of `Spritesheet` and `Graphic` to deliver custom on-canvas typography.
- The `DisplayGroup` and `DisplayGrid` classes, which allow entities to be nested and group hierarchically in a scene.
- The `EntityPool` class, which can manage a large collection of pre-allocated display entities that can be reused for improved performance.
- The `Canvas`, `Stage`, and `Demo` classes, which abstract all interactions with the Document Object Model and `<canvas>` element.
- The `RAFRenderer` class, which leverages the browser's `requestAnimationFrame` API to synchronize canvas updates with the browser's repaint timing.

Users can write event handlers that listen for and respond to events in a scene, including user input from a mouse or keyboard. The `Canvas` and `Stage` classes are responsible for quietly transforming DOM events into Fizz events in the context of a particular `Canvas`. This includes translations of coordinates from document-space to canvas-space.

Fizz entities can broadcast many events, including:

- `click` / `dblclick`
- `mousedown` / `mouseup`
- `mousemove`
- `added` / `removed`
- `death`

Fizz supports translation and scaling. It does not support entity rotation.

To support high frame rates with complex display-object graphs, Fizz automatically caches the visual state of each `DisplayEntity` and `DisplayGroup` by storing bitmap information inside of offscreen `<canvas>` elements; flags are used to mark changed objects as “dirty” between draw calls—allowing unchanged objects in the scene to be repainted quickly.

While writing Fizz, I followed a test-driven development strategy, using the open-source Jasmine test framework to define detailed specs for new classes and methods, and for describing the relationships between entities. The approach saved me many times from making mistakes or introducing insidious bugs. As I introduced new built-in functionality and new levels of abstraction, the level of effort needed to write new demos decreased substantially.

The default, minified Fizz distribution is ~50kB (12kB gzipped).
