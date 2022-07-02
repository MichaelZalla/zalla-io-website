+++
slug = "generating-typescript-for-fun-and-profit-part-1"
title = "Generating Typescript for Fun and Profit, Part 1"
author = "Michael Zalla"
publishdate = "2022-06-29T18:00:00-07:00"
imageCreditUrl = ""
imageCreditHandle = ""
series = "Generating TypeScript for Fun and Profit"
tags = [
  "typescript",
  "json",
  "recursion",
  "work-queues",
  "backtracking",
]
disqus_identifier = "generating-typescript-for-fun-and-profit-part-1"
disqus_title = "Generating Typescript for Fun and Profit, Part 1"
+++

## Introduction

This week I'm taking an opportunity to discuss a small project of mine named [Downlink]((/projects/downlink/)).

Downlink is a simple tool—written in TypeScript—that lets a developer convert arbitrary JSON inputs to a set of structured TypeScript interfaces. Doing so allows them to start working with that data in TypeScript—with all of TypeScript's type-safety features—while gaining a clearer understanding of the data itself. If the user is handling an especially large JSON payload (e.g.,&nbsp;a&nbsp;<10MB) coming from a poorly documented API, then this is especially valuable.

Here's a concrete example of what I'm talking about:

### Example input

```json
{
  "foo": true,
  "bar": 3.14,
  "hype": "beast",
  "favorites": ["breakfast", "lunch"],
  "clients": [
      {
          "id": 1,
          "name": "Stan",
          "contact-info": {
              "phone": "+1 (111) 111-1111",
              "email": "stan@company.com"
          }
      },
      {
          "id": 2,
          "name": "Beth",
          "contact-info": {
              "phone": "+1 (222) 222-2222",
              "email": "bethany@company.com"
          },
          "isAdmin": true
      }
  ],
  "yikes": [true, 2, "three"]
}
```

### Example output

```ts
interface IRootClientContactInfo {
    phone: string;
    email: string;
}

interface IRootClient {
    id: number;
    name: string;
    "contact-info": IRootClientContactInfo;
    isAdmin?: boolean;
}

interface IRoot {
    foo: boolean;
    bar: number;
    hype: string;
    favorites: string[];
    clients: IRootClient[];
    yikes: (boolean|number|string)[];
}
```

In this article, I'll be walking through my approach to solving this problem, in steps. I've included links to interactive code sandboxes—courtesy of [CodeSandbox](https://codesandbox.io)—so you can run the code shown in this article yourself. The last sandbox is under 130 lines of code, so we'll be exploring it all—starting with the Downlink API itself.

## The API

Downlink exposes a single function as its API:

```ts
downlink(json: string) => string;
```

Under the hood, this function generates output in 3 steps:

1. Converting the input string to an in-memory JSON object (tree) (using `JSON.parse()`).
2. Generating an abstract representation of the JSON tree's inherent structure.
3. Feeding this representational structure to a `render()` function (that outputs TypeScript).

Putting these pieces together, we have (at a high level):

```ts
const downlink = (json: string): string =>
{
  const data = JSON.parse(json)

  const root = makeField(`root`, data, `IRoot`)

  if(root)
  {
    return renderComplexField(root as ComplexField);
  }

  return ``;
}
```

## Primitive fields

### Representing primitives

In TypeScript, an interface is a collection of _field entries_. Each entry holds 2 key pieces of information: (1) the _name_ of the field, and (2) the _type_ (or types) of data that may be stored there:

```ts
interface IExample {
  fieldName: FieldType;
}
```

Imagine a simple case, where our input (JSON) has no nesting and holds only primitive value (e.g., only strings and numbers):

```json
{
  "category": "Eggs",
  "price": 2.49
}
```

In this scenario, we'd want to produce a single TypeScript interface—which we'll call `IProduct`—with corresponding fields—each being assigned exactly 1 type: either `string` or `number`:

```ts
interface IProduct {
    category: string;
    price: number;
}
```

These 2 fields could be represented like this in memory:

```js
const category = {
    fieldName: `category`,
    fieldType: `string`,
}

const price = {
    fieldName: `price`,
    fieldType: `number`,
}
```

Downlink is written in TypeScript, so it defines its own `Field` type to describe this exact format:

```ts {linenos=table}
type Field = {
    fieldName: string;
    fieldType: string;
}
```

In fact, Downlink defines a type `JsonType` to describe the set of possible values for `fieldType`:

```ts {linenos=table,hl_lines=["1-5",9]}
type JsonType =
    | `boolean`
    | `number`
    | `string`
    | `null`;

type Field = {
    fieldName: string;
    fieldType: JsonType;
}
```

Notice that—with the exception of `null`—these values correspond directly to the set of "type" values returned by JavaScript's `typeof` operator:

```ts {linenos=table}
typeof true // `boolean`
typeof 1.23 // `number`
typeof "Hello, TypeScript" // `string`
typeof null // `object`
```

To assign an appropriate `fieldType` to a `Field` record, Downlink uses `typeof` to implement a simple `getJsonType()` function:

```ts {linenos=table}
const getJsonType = (value: unknown): JsonType => {
  if(value === null) {
    return `null`
  }
  return (typeof value) as JsonType
}
```

Given a field's name and its (primitive) value (`data`), we can use `getJsonType()` to construct a matching `Field` record:

```ts
const makeField = (fieldName: string, data: unknown) => ({
  fieldName,
  fieldType: getJsonType(data),
})

const categoryField: Field = makeField(`category`, `Eggs`)

console.log(categoryField)
// { fieldName: `category`, fieldType: `string` }

const priceField: Field = makeField(`price`, 2.49)

console.log(priceField)
// { fieldName: `price`, fieldType: `number` }
```

#### Try it

{{< callout >}}
🏃 [Run it on CodeSandbox](https://codesandbox.io/s/cool-engelbart-s76m7l?file=/src/index.ts)
{{< /callout >}}

### Rendering primitives

As part of our work inside `render()`, we can use a field's attributes to render a field entry:

```ts
const renderField = (field: Field): string => {
  return `${field.fieldName}: ${field.fieldType};\n`
}

renderField(categoryField)
// `category: string;\n`

renderField(priceField)
// `price: string;\n`
```

#### Try it

{{< callout >}}
🏃 [Run it on CodeSandbox](https://codesandbox.io/s/crazy-leavitt-sechbf?file=/src/index.ts)
{{< /callout >}}

Now that we have a way to represent individual fields (by a name and type), we need a way to represent a _named collection_ of fields—or, an "object".

## Complex fields

### Collecting primitives

In the simple example above, `category` and `price` appear as sibling fields inside of our root object. In order to work with objects like this in TypeScript, we need to give a name to this structure and define its shape. Here, a "product" is just a collection of fields; in TypeScript, this constitutes an _interface._

Suppose we decide to call our interface `IProduct`. If we were to represent `IProduct` as a `Field`, it might look like this:

```ts
const product: Field = {
    fieldName: `product`,
    fieldType: `object`,
}
```

However, we can't fully describe `IProduct` without formally describing its _subfields_. How can we do this?

<!-- In its intermediate representation model, -->Downlink distinguishes _simple fields_ from _complex fields_. Simple fields may only hold primitive JSON types, while complex fields store object types (including array types).

In keeping with this distinction, Downlink doesn't tie subfield information directly to the `Field` type. Instead, it organizes this information with an extended type, named `ComplexField`:

```ts
type ComplexField = Field & {
  fieldType: `object`;
  fields: {
    [name: string]: Field;
  };
}
```

Note that, alternately, we could use an array-type for `fields`:

```ts {linenos=table,hl_lines=[3]}
type ComplexField = Field & {
  fieldType: `object`;
  fields: (Field | ComplexField)[];
}
```

Let's look at what we've added here:

- All complex fields will be assigned the `fieldType` value `"object"`. Thus, we override `Field::fieldType` to use the string literal type `'object'`. We'll also have to update `JsonType` to include `'object'`:

  ```ts {linenos=table,hl_lines=[5]}
  type JsonType =
    | 'boolean'
    | 'number'
    | 'string'
    | 'object'
    | `null`;
  ```

- The type `ComplexField::fields` is exactly what you might expect: a collection of `<FieldName, Field>` records that we can iterate through.

Now we can expand our intermediate representation, `product`, using `ComplexField`:

```ts {linenos=table,hl_lines=[1,"4-7"]}
const product: ComplexField = {
  fieldName: `product`,
  fieldType: `object`,
  fields: {
    category: makeField(`category`, `Eggs`),
    price: makeField(`price`, 2.49),
  }
}
```

Let's update our `makeField()` function to support complex fields:

```ts
const makeField = (
  fieldName: string,
  data: unknown
): Field | Partial<ComplexField> => {

  const hasSubfields = !!(typeof data === `object` && data !== null)

  let subfields: { [fieldName: string]: Field } = {}

  if (hasSubfields) {
    for (let key in data as any) {
      subfields[key] = makeField(key, (data as any)[key]);
    }
  }

  return {
    fieldName,
    fieldType: getJsonType(data),
    ...(hasSubfields ? { fields: subfields } : {})
  }

}
```

We can see the new `ComplexField` structure generated by `makeField()` for our product:

```ts
const product: ComplexField = makeField(`product`, {
  category: makeField(`category`, `Eggs`),
  price: makeField(`price`, 2.49)
}) as ComplexField;

console.log(product);

// {
//     "fieldName": "product",
//     "fieldType": "object",
//     "fields": {
//         "category": {
//             "fieldName": "category",
//             "fieldType": "string"
//         },
//         "price": {
//             "fieldName": "price",
//             "fieldType": "number"
//         }
//     }
// }
```

#### Try it

{{< callout >}}
🏃 [Run it on CodeSandbox](https://codesandbox.io/s/broken-dawn-qs1qt0?file=/src/index.ts)
{{< /callout >}}

### Naming collections

Our interface representation is almost complete, but it still needs a unique name. Downlink derives interface names based on the sequence of keys used to access the relevant object in the original JSON.

Take a look at the example JSON below:

```json
{
  "data": {
    "parcel": {
      "estate": {
        "id": "estate-0x959e104e1a4db6317…",
        "x": "2",
        "y": "-96"
      }
    }
  }
}
```

Here, `estate` is a field-collection that can be represented in TypeScript with an interface. The sequence of keys (or _keychain_) used to access it from the root would be: `data` ⇨ `parcel` ⇨ `estate`. Thus, Downlink constructs the name `IDataParcelEstate` for the resulting interface definition.

We can expand our `ComplexField` so that we have a place to store that name:

```ts {linenos=table,hl_lines=[3]}
type ComplexField = Field & {
  fieldType: `object`,
  interfaceName: string;
  fields: {
    [name: string]: Field;
  };
}
```

Let's apply this to `product`. In the original JSON above, our product constitutes the entire JSON input—the _root object_. In JSON, the root object is the only object that has no key associated with it. Since our generated interface names are derived from keys, we'll need a special, hard-coded name to reference the root object's interface. Downlink uses `IRoot`. Note that we also use a hard-coded value, `root`, as this object field's `fieldName`:

```ts {linenos=table,hl_lines=[4]}
const product: ComplexField = {
  fieldName: `root`,
  fieldType: `object`,
  interfaceName: `IRoot`,
  fields: {
    category: makeField(`category`, `Eggs`),
    price: makeField(`price`, 2.49),
  }
}
```

Later, we'll take a look at the code for generating these interface names from keychains. For now, assume we pass one to our `makeField()` function:

```ts {linenos=table,hl_lines=["3-4",20]}
const makeField = (
  fieldName: string,
  data: unknown,
  interfaceName?: string
): Field | Partial<ComplexField> => {

  const hasSubfields = !!(typeof data === `object` && data !== null)

  let subfields: { [fieldName: string]: Field } = {};

  if (hasSubfields) {
    for (let key in data as any) {
      subfields[key] = makeField(key, (data as any)[key]);
    }
  }

  return {
    fieldName,
    fieldType: getJsonType(data),
    ...(hasSubfields ? { interfaceName } : {}),
    ...(hasSubfields ? { fields: subfields } : {})
  }

}
```

### Rendering collections

Let's update our `renderField()` function to support these new complex fields. To start, we'll create a type-guard, `isComplexField()`, to let us know whether the field we're handling is a simple field or a complex one:

```ts
const isComplexField = (field: Field): field is ComplexField =>
  !!(field.fieldType === `object`);
```

We can use our type-guard inside of `renderField()` to customize how complex fields (i.e., _interfaces_) are rendered:

```ts {linenos=table, hl_lines=["3-16"]}
const renderField = (field: Field): string => {

  if(isComplexField(field))
  {
    let renderedInterface = `interface ${field.interfaceName} {\n`;

    for (const key in field.fields)
    {
      renderedInterface += `    ${renderField(field.fields[key])}`;
    }

    renderedInterface += `}\n`;

    return renderedInterface;

  }

  return `${field.fieldName}: ${field.fieldType};\n`;

}
```

Passing our complex `product` field to `renderField()`, we get the following output:

```ts
const product: ComplexField = makeField(`product`, {
  category: makeField(`category`, `Eggs`),
  price: makeField(`price`, 2.49)
}, `IProduct`) as ComplexField;

console.log(renderField(product));

// interface IProduct {
// 	category: string;
// 	price: number;
// }
```

#### Try it

{{< callout >}}
🏃 [Run it on CodeSandbox](https://codesandbox.io/s/heuristic-minsky-ih7tb9?file=/src/index.ts)
{{< /callout >}}

## Nested fields

### Representing nested collections

Primitive collections are great, but most JSON we encounter will include some level of nesting. Suppose the JSON that we're working with associates each `product` with an `order` from a customer. It might look like this:

```json
{
  "id": "9AW8FUX9APW",
  "date": "2022-06-29T15:44:50Z",
  "customerId": "MXNEHLFAIW",
  "product": {
    "category": "Eggs",
    "price": 2.49
  }
}
```

To support objects that are nested within `IRoot`, we'll need to enhance `ComplexType` to support _complex subfields_.

Let's first extract `ComplexField::fields` to its own named type:

```ts {linenos=table, hl_lines=["1-3",7]}
type FieldMap = {
  [name: string]: Field;
}

type ComplexField = Field & {
    interfaceName: string;
    fields: FieldMap;
}
```

Now all we need to do is include `ComplexField`:

```ts {linenos=table, hl_lines=[2]}
type FieldMap = {
  [name: string]: Field | ComplexField;
}

type ComplexField = Field & {
    interfaceName: string;
    fields: FieldMap;
}
```

We can now represent the JSON above using our updated `ComplexField` type, illustrating complex field composition:

```ts
const order: ComplexField = {
  fieldName: `root`,
  fieldType: `object`,
  interfaceName: `IRoot`,
  fields: {
    id: {
      fieldName: `id`,
      fieldType: `string`
    },
    date: {
      fieldName: `date`,
      fieldType: `string`
    },
    customerId: {
      fieldName: `customerId`,
      fieldType: `string`
    },
    product: {
      fieldName: `product`,
      fieldType: `object`,
      interfaceName: `IRootProduct`,
      fields: {
        category: {
          fieldName: `category`,
          fieldType: `string`
        },
        price: {
          fieldName: `price`,
          fieldType: `number`
        }
      }
    }
  }
}
```

Hopefully this gives some better intuition for the intermediate representations we're generating.

If we pass `order` to our current `renderField()` code, you can see what we get:

```ts
console.log(renderField(order));

// interface IRoot {
//     id: string;
//     date: string;
//     customerId: string;
//     interface IRootProduct {
//     category: string;
//     price: number;
// }
// }
```

Yeah. Not exactly ideal.<span><br /><br /></span>

#### Try it

{{< callout >}}
🏃 [Run it on CodeSandbox](https://codesandbox.io/s/sweet-frost-lrimvp?file=/src/index.ts)
{{< /callout >}}

### Refactoring renderField()

Our method for rendering interfaces works just fine for the top-level interface, `IRoot`—but any nested interfaces should be described (_rendered_) as their own standalone item in the output. How can we solve this?

To start, we can split our "simple" and "complex" rendering cases into separate functions: `renderField()`, which serves as our base case, and `renderComplexField()`, which models our (potentially) recursive case:

```ts {linenos=table, hl_lines=[]}
const renderField = (field: Field): string => {
  return `${field.fieldName}: ${field.fieldType};\n`;
}

const renderComplexField = (field: ComplexField): string => {

  let renderedInterface = `interface ${field.interfaceName} {\n`;

  for (const key in field.fields)
  {
    let subfield = field.fields[key]

    renderedInterface += `    `;

    if(isComplexField(subfield))
    {
      renderedInterface += `${key}: ${renderComplexField(subfield)}`;
    }
    else
    {
      renderedInterface += renderField(subfield)
    }
  }

  renderedInterface += `}\n`;

  return renderedInterface;

}
```

Note that we also updated the function to output the _field key_ that is using the nested interface:

```ts {linenos=table, hl_lines=[3]}
if(isComplexField(subfield))
{
  renderedInterface += `${key}: ${renderComplexField(subfield)}`;
}
```

<!-- We'll have to update our top-level `downlink()` function to call the correct render function:

```ts
const downlink = (json: string): string =>
{
  const data = JSON.parse(json)

  const root = makeField(`root`, data, `IRoot`)

  if(root)
  {
    return renderComplexField(root as ComplexField);
  }

  return ``;
}
``` -->

We can pass `order` through this function again to verify that `IRootProduct` is given a key:

```ts
console.log(renderField(order));

// interface IRoot {
// 	id: string;
// 	date:string;
// 	customerId:string;
// 	product: interface IRootProduct {
// 	category: string;
// 	price: number;
// }
// }
```

#### Try it

{{< callout >}}
🏃 [Run it on CodeSandbox](https://codesandbox.io/s/recursing-star-fqv1wx?file=/src/index.ts)
{{< /callout >}}

### Rendering nested collections

Now, how can we extract `IRootProduct` to be its own top-level item in the output?

First, let's just assume for now that any JSON passed to our converter will come either as an object (i.e., a _tree_), or as an array—anything else would be invalid JSON. Ignoring the array scenario for now, we can generalize this problem as _processing a tree, but outputting a list_.

A popular solution to this problem is the _"work queue"_: as we traverse our tree input, we maintain a queue—which we'll call the _"frontier"_—and whenever we encounter a complex field (interface), we add it to the frontier, and move on.

Let's update `renderComplexField()` to use a work-queue model:

```ts {linenos=table, hl_lines=["3-8","20-23","33-36"]}
const renderComplexField = (root: ComplexField): string => {

  let frontier: ComplexField[] = [root]
  let renderedInterfaces: string[] = []

  while(frontier.length)
  {
    let field = frontier.pop()

    let renderedInterface = `interface ${field.interfaceName} {\n`;

    for (const key in field.fields)
    {
      let subfield = field.fields[key]

      renderedInterface += `    `;

      if(isComplexField(subfield))
      {
        frontier.push(subfield)

        renderedInterface +=
          `${subfield.fieldName}: \${subfield.interfaceName};\n`;
      }
      else
      {
        renderedInterface += renderField(subfield)
      }
    }

    renderedInterface += `}\n`;

    renderedInterfaces.push(renderedInterface);
  }

  return `${renderedInterfaces.join(`\n`)}\n`

}
```

Notice how the code above converts `renderComplexField()` from a recursive function to an _iterative_ one: we begin with a `frontier` that holds the `root` argument as its only item. As `root` is processed, any nested objects we encounter will be added to the back of `frontier` to be processed later. Within its parent interface, a nested interface is represented simply by its `interfaceName`.

Let's re-run our renderer on `order` and see the result:

```ts
console.log(renderComplexField(order));

// interface IRoot {
// 	id: string;
// 	date:string;
// 	customerId:string;
// 	product: IRootProduct;
// }
//
// interface IRootProduct {
// 	category: string;
// 	price: number;
// }
//
```

#### Try it

{{< callout >}}
🏃 [Run it on CodeSandbox](https://codesandbox.io/s/bold-einstein-fh3815)
{{< /callout >}}

We're almost there! As a final step, let's reverse the order of our outputs so that child interfaces are declared before their parents. This isn't actually required by TypeScript, but I think it offers an output that's easier for our users to understand.

```ts
return `${renderedInterfaces.reverse().join(`\n`)}\n`
```

We now get the following result:

```ts
console.log(renderComplexField(order));

// interface IRootProduct {
// 	category: string;
// 	price: number;
// }
//
// interface IRoot {
// 	id: string;
// 	date:string;
// 	customerId:string;
// 	product: IRootProduct;
// }
//
```

Pretty sweet!

### Leveraging keychains

In these last examples, we manually created `order` as a `ComplexField`, with its interface names `IRoot` and `IRootProduct` hard-coded in the structure. To be useful, our converter needs to come up with the names of nested interfaces automatically—based on the original JSON it receives.

Looking back to our `downlink()` function, we can see that it hard-codes an `IRoot` interface name, which is passed into `makeField()`:

```ts {linenos=table, hl_lines=[]}
const root = makeField(`root`, data, `IRoot`)
```

This takes care of one interface name. Let's take a look again at the JSON from our "order" example:

```json
{
  "id": "9AW8FUX9APW",
  "date": "2022-06-29T15:44:50Z",
  "customerId": "MXNEHLFAIW",
  "product": {
    "category": "Eggs",
    "price": 2.49
  }
}
```

Above, `product` is a top-level key under `IRoot`. How can we create the name `IRootProduct` automatically when processing `product`?

The key to this problem lies in…well, the keys. The JSON keys, that is! The trick is to keep track of where we are in the JSON tree with respect to the root.

We can solve this problem by updating `makeField()` to do the following:

- Accept a `keychain` argument instead of a literal `interfaceName`.
- For complex fields, use `keychain` to generate an appropriate `interfaceName`.
- Pass an extended `keychain` argument into each recursive call (for subfields).

Similar approaches are sometimes seen in recursive-backtracking algorithms, but our `makeField()` function will explore the entire "solution space", if you will, by traversing the entire tree. We'll never call `keychain.pop()` for any reason—we'll only copy and extend `keychain`, passing it down to each child call.

Putting it together, we get the following code:

```ts {linenos=table,hl_lines=["1-6",11,"18-21",28]}
const pascal = (value: string) => string {/* ... */}
const singularize = (value: string) => string {/* ... */}

const getInterfaceName = (keychain: string[]): string => {
  return `I${keychain.map(k => pascal(singularize(k))).join('')}`
}

const makeField = (
  fieldName: string,
  data: unknown,
  keychain: string[] = [`root`]
): Field | Partial<ComplexField> => {

  const hasSubfields = !!(typeof data === `object` && data !== null)

  if (hasSubfields) {
    for (let key in data as any) {
      let childData = (data as any)[key]
      let childKeychain = [...keychain, key]

      subfields[key] = makeField(key, childData, childKeychain)
    }
  }

  return {
    fieldName,
    fieldType: getJsonType(data),
    ...(hasSubfields ? { getInterfaceName(keychain) } : {}),
    ...(hasSubfields ? { fields: subfields } : {})
  }

}
```

Note that we need to update `downlink()` so that it correctly calls `makeField()`. We can omit the `keychain` argument and rely on the default:

```ts {linenos=table, hl_lines=[5]}
const root = makeField(`root`, data)
```

If we've implemented things right, we should be able to pass `order` through our `renderComplexField()` function and still get the same result (but this time, with dynamic interfaces!):

```ts
console.log(renderField(order));

// interface IRootProduct {
// 	category: string;
// 	price: number;
// }
//
// interface IRoot {
// 	id: string;
// 	date:string;
// 	customerId:string;
// 	product: IRootProduct;
// }
//
```

#### Try it

{{< callout >}}
🏃 [Run it on CodeSandbox](https://codesandbox.io/s/confident-paper-9huugh?file=/src/index.ts)
{{< /callout >}}

## Testing

Admittedly, we've only thrown a handful of inputs at our converter. Hopefully though, by reading the final code, you can convince yourself that it works for any nesting depth—but just in case you can't, let's pass in a more complicated "order":

```ts
const enhancedOrderJson = `
  {
    "id": "9AW8FUX9APW",
    "date": "2022-06-29T15:44:50Z",
    "customerId": "MXNEHLFAIW",
    "product": {
      "category": "Eggs",
      "price": 2.49,
      "seller": {
        "name": "Lucky Cow Farms"
      }
    },
    "tracking": {
      "trackingNumber": "895012834780950"
    }
  }
`

console.log(
  downlink(enhancedOrderJson)
)
```

As we'd hoped, our converter correctly handles more deeply nested objects (like `product.seller`):

```ts
// interface IRootProductSeller {
//     name: string;
// }
//
// interface IRootProduct {
//     category: string;
//     price: number;
//     seller: IRootProductSeller;
// }
//
// interface IRootTracking {
//     trackingNumber: string;
// }
//
// interface IRoot {
//     id: string;
//     date: string;
//     customerId: string;
//     product: IRootProduct;
//     tracking: IRootTracking;
// }
//
```

{{< callout >}}
🏃 [Run it on CodeSandbox](https://codesandbox.io/s/stoic-fermat-dk53uy?file=/src/index.ts)
{{< /callout >}}

We haven't touched on the topic of _unit&nbsp;testing_, but you can imagine how insanely valuable it is for our use-case: an API with a single function (`downlink()`), which accepts a single, structured input (`json`), and outputs an (arguably structured) string.

In the future, we'll take a look at how we can bring unit testing into the picture, and use it to locate edge-cases while avoiding regressions.

## Wrapping up

…for now, that is.

If we ever want to expect other developers to use our converter, there are still a few features we need to support; namely, array types—which are ubiquitous in JSON. We'll also want to throw a significant number of test inputs at our converter, and make sure those inputs are properly handled. These inputs might include empty interfaces (`{}`), nested arrays, root-level arrays, as well as mixed-type fields. Then our converter can be truly powerful!

Converting JSON data to TypeScript interfaces may be a niche problem, but the approach shown here could be used as a mental springboard to approach other, more challenging problems—like writing the front-end of a compiler or interpreter. _Generating abstract representations of input_ becomes very important here.

Having an abstract representation of JSON data may be overkill for our converter: we _could_ just pass the literal data _directly_ to a render function. After all, the metadata stored in `Field` and `ComplexField` is just derived from this data, and could be derived _just before rendering_…

Still, these abstract structures often enable us to write powerful programs that operate on diverse inputs. Later, when we implement array-type fields, we'll see how this representation model is necessary to store information that _isn't_ entirely local to one field (such as whether or not that field is _guaranteed_ or _optional_).

In less than [130 lines of code](https://codesandbox.io/s/stoic-fermat-dk53uy?file=/src/index.ts:0-2878), we've managed to solve a non-trivial problem, and do so in a way that progressively builds a solution by layering one feature on top of another.

### Feedback

If you have any thoughts, questions, or corrections to this article or its code sandboxes, please drop a comment in the Disqus thread below!

### Related links

- [Downlink on Github](https://github.com/MichaelZalla/downlink/)
- [Downlink on NPM](https://www.npmjs.com/package/downlink)
- [Inspiration: vscode-json-to-ts](https://github.com/MariusAlch/vscode-json-to-ts)
- [Inspiration: vscode-json-to-js-object](https://github.com/sallar/vscode-json-to-js-object)
