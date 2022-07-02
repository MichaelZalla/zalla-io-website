+++
title = "Downlink"
description = "Instantly convert JSON to TypeScript interfaces."
year = "2022"
season = "spring"
technologies = [
    "TypeScript",
    "Jest",
    "Jest Snapshot Testing",
    "GitHub Actions",
]
repository = "https://github.com/MichaelZalla/downlink/"
hasDemo = true
demo_url = "https://runkit.com/michaelzalla/62b7a291aab9f800087d4fa8"
swatch = "#247469"
+++

Downlink is a JavaScript module that converts complex JSON payloads into usable TypeScript interfaces. Inspired by VS&nbsp;Code extensions that were useful to me in the past, I wrote my own recursive interface generator as a programming exercise. {{< read-more-button >}}

For a more in-depth discussion of Downlink and its implementation, check out, [Generating Typescript for Fun and Profit, Part 1](/articles/generating-typescript-for-fun-and-profit-part-1/).

<!--
{{< callout >}}
```plaintext
npm i downlink
```
{{< /callout >}}
-->

## Overview

Downlink takes the same general approach as code compilers (or transpilers), using depth-first search to generate an intermediate representation of the given data. This intermediate representation holds all of the information needed to accurately represent a complex object interface, and render (or emit) it as a valid string of TypeScript. The total set of nested objects, together with the root object (or array), are mapped to a flattened list of TypeScript interfaces. Downlink ultimately renders this list as a multi-line string of output.

Downlink supports all JSON primitive types, together with nested objects and arrays. Nested objects are identified by the _sequence_ of keys used to access them from the root object; interface names are generated using these key sequences, or "keychains".

<!--
Because all valid JSON records consist of at least 1 object—the root object—Downlink will always emit an `IRoot` interface (with a default export included):

```ts
interface IRoot {
    errorCode: number;
    errorMessage: string;
}

export default IRoot
```
-->

In supporting array types, Downshift tracks the set of unique value types contained in an array, and uses this information to identify and render multi-type fields. Consider the following JSON:

```json
{ "yikes": [true, 2, "three"] }
```

Downlink infers that an entry `yikes` may be 1 of 3 possible types: `boolean`, `number`, or `string`:

```ts
interface IRoot {
    yikes: (boolean|number|string)[];
}
```

Similarly, given a complex array of objects, Downlink links all object entries to one interface, and performs a second pass on the entries to identify which of their fields are guaranteed, and which are optional. In the example array below, notice how neither `color['is-neutral']` nor `color.type` is guaranteed:

```json
{
    "colors": [
        {
            "color": "black",
            "type": "primary",
            "is-neutral": true
        },
        {
            "color": "white",
            "is-neutral": true
        },
        {
            "color": "red",
            "type": "primary"
        }
    ]
}
```

Downlink will indicate this in its output:

```ts
interface IRootColor {
    color: string;
    "is-neutral"?: boolean;
    category: string;
    type?: string;
}
```

## Testing

Downlink's internal functionality is implemented in 3 modules:

- `field`: Defines core data types, including `Field` and `FieldMap`, as well as `getFieldMap()`—the function responsible for producing the intermediate representation of the JSON input.
- `render`: Defines the `renderFields()` function, which accepts an intermediate representation and emits TypeScript interfaces to standard output.
- `utils`: Contains simple utilities for determining JSON field-types, as well as string manipulations for producing valid, human-friendly interface names from JSON keys.

This project uses [Jest](http://jestjs.io) to run a family of unit tests across these 3 modules. Tests are written in a bottom-up fashion, testing smaller pieces of functionality first.

```bash
MichaelallasMBP:downlink michaelzalla$ npm run-script test

> downlink@0.0.5 test
> jest

 PASS  src/ts/convert/__tests__/field.test.ts
 PASS  src/ts/convert/__tests__/utils.test.ts
----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------|---------|----------|---------|---------|-------------------
All files |   91.13 |    85.29 |   92.85 |   90.14 |
 field.ts |      86 |    78.26 |    87.5 |    85.1 | 126-144,189
 utils.ts |     100 |      100 |     100 |     100 |
----------|---------|----------|---------|---------|-------------------

Test Suites: 2 skipped, 2 passed, 2 of 4 total
Tests:       2 skipped, 39 passed, 41 total
Snapshots:   8 passed, 8 total
Time:        5.775 s
Ran all test suites.
```

Higher-level tests operate on complex JSON inputs, and assert conditions on the resulting `FieldMap`. These tests make use of Jest's [Snapshot Testing](https://jestjs.io/docs/snapshot-testing) features to quickly and easily catch regressions on even the most complex object representations—without needing to write significant test code.

Jest is configured to write code-coverage stats to a local `./coverage` folder. A `badges` NPM script then uses [`jest-coverage-badges`](https://www.npmjs.com/package/jest-coverage-badges) to generate accurate _coverage badges_ as SVGs, which are linked to from the project's [README file](https://github.com/MichaelZalla/downlink/blob/main/README.md).

Unit testing was instrumental in organizing my thoughts and intentions while coding, and for identifying, modeling, and testing edge cases.

## Automation

Downlink's GitHub repository leverages GitHub Actions to provide continuous integration. A `main.yml` file in the `.github/workflows` folder configures a workflow named "CI", which performs a fresh repository checkout, installs dependencies with `npm`, and runs tests with Jest.

Actions are triggered whenever a contributor pushes new commits to `main`, and results are reported on GitHub's [Actions panel](https://github.com/MichaelZalla/downlink/actions). The result of the most recent action ('pass' or 'fail') is displayed on the main repository page, next to its associated commit.

## Distribution

New versions of Downlink are published to the main NPM registry with `npm publish`.

## Areas for improvement

There's plenty of opportunity to make Downlink more robust and useful. JSON, by its nature, can be arbitrarily complex and heterogeneous—which means that the opportunity for edge-case consideration and test coverage is vast. Below are some areas for improvement.

### Merge identical interfaces

Conceptually, the fingerprint of an interface is its unique set of fields (i.e., field names and their corresponding field types). In some cases, different instances of the same interface can be found in our JSON input—even when these instances aren't siblings in a list.

This could be accomplished by implementing an _interface cache_. This merging step could take place after all recursion is finished, before we render. The flattened set of interfaces could be cross-checked for uniqueness; matching interfaces could be renamed to a single interface, and references to the old interface names could be patched.

This concept could be taken further by supporting self-referential interfaces; that is, interfaces that include pointers to other instances of that interface. A simple example of this is a singly-linked list in JSON, in which each `INode` contains a `next` field whose value is also an `INode`:

```json
{
    "data": 0.49886610143009724,
    "next": {
        "data": 0.9326644278966507,
        "next": {
            "data": 0.727208413259806,
            "next": {
                "data": 0.07451898338676854,
                "next": null
            }
        }
    }
}
```

Feeding this example to Downlink, you can see that the results aren't exactly ideal:

```ts
interface IRootNextNextNext {
    data: number;
    next: undefined;
}

interface IRootNextNext {
    data: number;
    next: IRootNextNextNext;
}

interface IRootNext {
    data: number;
    next: IRootNextNext;
}

interface IRoot {
    data: number;
    next: IRootNext;
}

export default IRoot
```

### Reconcile arbitrarily-nested optional fields

Downlink supports the optional indicator (e.g., `?`) for top-level (object) fields in a collection. Perhaps it would be better to reconcile the optional status of fields nested inside of child interface—sinces these child interfaces are still repeated across the collection:

```json
[
  {
    "_id": "62b7f80c14e0f8ee3525acfc",
    "data": {
      "x": -86.980394,
      "y": 14.70842,
    }
  },
  {
    "_id": "62b7f80c92f8393c4e4ced11",
    "data": {
      "x": -0.711021
    }
  },
  {
    "_id": "62b7f80c0b9f07b6a2237060",
    "data": {
      "x": -37.599097,
      "y": 21.672581
    }
  }
]
```

This rests on an assumption that the JSON arrays fed to Downlink are collections of _conceptually homogeneous_ entries (e.g., "users", "click events", "house listings", etc). If Downlink is fed an array of entirely heterogenous entries, then the concept of "optionality" becomes moot.

### String-union types

Strings (and string fields) in a collection sometimes only hold 1 of a few possible values. For example, a `cardType` field may hold values like `'Visa'`, `'Mastercard'`, and `'AMEX'`. If consumers of this data need to write business logic around this field, it's very helpful to see the fixed set of possible values instead of a generic `string` type:

```ts
    // Generic type
    cardType: string;

    // Exhaustive union type
    cardType: `Visa`|`Mastercard`|`AMEX`;
```

To accomplish this, we could record the set of all unique values encountered while reading a given array of strings—or an array of objects holding strings—and compare the final set size against some heuristic (say, 5). If 5 or fewer unique values are seen in the input, we swap the field's generic `string` type with an appropriate string-union type (e.g., `'Visa'|'Mastercard'|'AMEX'`).

<!-- ## Support for additional JavaScript types -->
<!-- Date, Function, etc -->

## Inspiration

Below are some similar packages (or editor extensions) that inspired this project:

- [vscode-json-to-ts](https://github.com/MariusAlch/vscode-json-to-ts)
- [vscode-json-to-js-object](https://github.com/sallar/vscode-json-to-js-object)
