+++
slug = "react-i18n"
title = "react-i18n"
description = ""
year = "2022"
season = "summer"
technologies = [
    "TypeScript",
    "React",
]
swatch = "#973C87"
repository = "https://github.com/MichaelZalla/react-i18n"
hasDemo = true
demo_url = "https://codesandbox.io/s/yvsm2m?file=/src/App.js"
disqus_identifier = "react-i18n"
disqus_title = "react-i18n"
+++

The `react-i18n` library offers a simple set of React hooks to help you localize your web app quickly and easily. The package is mainly suited for client-side-rendered apps that can be localized at runtime rather than at build time—but it can also be used to localize a server-side-renderer (SSR) app. {{< read-more-button >}}

## Motivation

Server-side rendering typically offer significant advantages in terms of SEO, content previews, etc. That being said, there are still countless client-side-rendered apps alive today, and countless React developers who do not yet have access to the server infrastructure needed to support SSR. By using a library like `react-i18n` in their client-side app, a developer can introduce new languages and localization features incrementally—and still leverage that work if-and-when they migrate their app to the server.

The `react-i18n` API takes design cues from the [`angular-localization`](https://github.com/doshprompt/angular-localization) library. Introduced in 2014, this library sought to give similar localization powers to AngularJS developers through Angular-native directives, filters, etc. The `react-i18n` library was specifically created for React apps, so it exposes functionality through 3 React-centric constructs: _hooks_, _contexts_, and _components_. The library is written in TypeScript, so it offers strong type support to anyone using it.

The `react-i18n` package is 7 kB gzipped. It has zero external dependencies (although it _does_ list some `peerDependencies`, such as `react` and `react-router`, which your app probably depends on anyway).

## Quick Start

Integrating `react-i18n` into an existing React app is simple. Suppose we start with the following `App` component, which has just ` string—"Hello, React!"—hardcoded in English:

```tsx
// src/components/App/App.tsx

const App = () => {

  return (
    <div>
      {/* @TODO Localize me! */}
      <h1>Hello, React!</h1>
    </div>
  )

}
```

### 1. Extract our display content

Let's move this content out of our code and into a static JSON file:

```js
// public/static/languages/en/components.lang.json

{
  "App": {
    "greeting": "Hello, React!"
  }
}
```

We can duplicate this file once for each language that our app will support:

```js
// public/static/languages/fr/components.lang.json

{
  "App": {
    "greeting": "Bonjour, React!"
  }
}
```

With our display content extracted from our source code, let's turn our attention back to our `App`  component.

### 2. Initialize the `react-i18n` library

To make use of `react-i18n`'s localization powers, we can start by calling the `useI18nSettings()` hook:

```tsx {linenos=table,hl_lines=[2,"6-11"]}
// src/components/App/App.tsx
import { useI18nSettings } from 'react-i18n'

const App = () => {

  const [
    currentLanguage,
    setCurrentLanguage,
    settings,
    setSettings,
  ] = useI18nSettings()

  return (
    <div>
      <h1>Hello, React!</h1>
    </div>
  )

}
```

This initializes the library and gives us a `setSettings()` function that we can call with our app-specific settings:

```tsx {linenos=table,hl_lines=[2,"15-26"]}
// src/components/App/App.tsx
import React from 'react'

import { useI18nSettings } from 'react-i18n'

const App = () => {

  const [
    currentLanguage,
    setCurrentLanguage,
    settings,
    setSettings,
  ] = useI18nSettings()

  React.useEffect(() => {

    // We'll support English and French

    setSettings({
      supportedLanguages: [
        'en',
        'fr',
      ],
    })

  }, [])

  return (
    <div>
      <h1>Hello, React!</h1>
    </div>
  )

}
```

### 3. Share the localization state

We can share these settings with the entirety of our app's component tree by wrapping our content in an `I18nSettingsContext.Provider`:

```tsx {linenos=table,hl_lines=[4,"20-25",31]}
// src/components/App/App.tsx
import React from 'react'

import { useI18nSettings, I18nSettingsContext } from 'react-i18n'

const App = () => {

  const [
    currentLanguage,
    setCurrentLanguage,
    settings,
    setSettings,
  ] = useI18nSettings()

  React.useEffect(() => {
    ...
  }, [])

  return (
    <I18nSettingsContext.Provider value={[
      currentLanguage,
      setCurrentLanguage,
      settings,
      setSettings,
    ]}>

      <div>
        <h1>Hello, React!</h1>
      </div>

    </I18nSettingsContext.Provider>
  )

}
```

### 4. Use the `I18n` component

As a final step, we can leverage the `I18n` component to localize "Hello, React!". `I18n` requires a key—passed as `k`—to indicate the string we want to render:

```tsx {linenos=table,hl_lines=[4,"29-31"]}
// src/components/App/App.tsx
import React from 'react'

import { useI18nSettings, I18nSettingsContext, I18n } from 'react-i18n'

const App = () => {

  const [
    currentLanguage,
    setCurrentLanguage,
    settings,
    setSettings,
  ] = useI18nSettings()

  React.useEffect(() => {
    ...
  }, [])

  return (
    <I18nSettingsContext.Provider value={[
      currentLanguage,
      setCurrentLanguage,
      settings,
      setSettings,
    ]}>

      <div>
        <h1>
          <I18n k='components.App.greeting'>
            {/* Hello, React! */}
          </I18n>
        </h1>
      </div>

    </I18nSettingsContext.Provider>
  )

}
```

The `I18n` component takes our key `k` and uses it to asynchronously resolve the correct string in the correct language. The component renders to a `span` tag, with the resolved string as its text.

## Content scoping

In the code above, we passed the key `'components.App.greeting'` to `I18n`, but we didn't actually specify _where_ the library should look to find the corresponding string. Yet, our component still renders the correct string from our JSON. How does this work?

### Keys and files

Earlier, when we called `setSettings()` from inside our `App` component, we passed it an object with just one setting—`supportedLanguages`:

```ts
setSettings({
  supportedLanguages: [
    'en',
    'fr',
  ],
})
```

For convenience, `setSettings()` will fill in any missing settings with a set of defaults:

```ts
export const DefaultI18nSettings: I18nSettings = {
  preferredLanguage: I18nLocaleIdentifiers.English,
  defaultLanguage: I18nLocaleIdentifiers.English,
  supportedLanguages: [
    I18nLocaleIdentifiers.English,
  ],
  keyErrorMessage: `%%_USE_I18N_STRING_ERROR_%%`,
  getContentsURL,
}
```

One of these settings—`getContentURL`—is a function used to translate a given content key to its associated file location. The function takes 2 arguments: `language` and `scope`. The library provides the following default implementation:

```ts
const getContentsURL = (
  language: I18nLocaleIdentifier,
  scope: string): string =>
{
  // Supports unique `development` and `production` base URLs:
  // - Honors `PUBLIC_URL` for Create React App projects;
  // - Honors `NEXT_PUBLIC_BASE_PATH` for NextJS projects;
  const BASE_URL =
    process.env.PUBLIC_URL ||
    process.env.NEXT_PUBLIC_BASE_PATH ||
    ''

  return `${BASE_URL}/static/languages/${language}/${scope}.lang.json`
}
```

### Scopes

A _scope_ refers to a specific file location where a given _key_ and its value live. Scoping our keys allows us to succinctly organize our localization content across multiple files and/or locations—so that we don't need to maintain all of our app's localizable content inside of a single JSON file. For a given key, the _scope_ is always the first component in the key's keychain. For example, `'components.App.greeting'` has the scope `'components'`.

Because the `getContentURL` setting can be set to any custom function, it offers developers significant flexibility over where and how their content is organized on the web. Developers and teams can adopt whatever conventions suit their needs; the library merely provides a default.

The `getContentURL()` function is only expected to return _a valid URL_; this could be a file path relative to our app (or our webserver), but it could just as easily be the URL of a file hosted on another server or domain—or even a URL to call a remote API that returns localization content from a live database.

### Shared scopes

One significant advantage to this approach is that our localized content can easily be shared across multiple React apps, by consolidating shared content under one or more shared scopes—and then implementing `getContentURL()` to fetch strings in these scopes from a shared file or files.

```ts
const myCustomGetContentsURL = (
  language: I18nLocaleIdentifier,
  scope: string): string =>
{
  switch(scope)
  {
    case `common`:
      return `/shared-assets/languages/${language}/common.lang.json`
    default:
      return `${process.env.PUBLIC_URL}/static/languages/${language}/${scope}.lang.json`
  }

}
```

## Interpolating data

The approach above works to localize all of the _static_ strings in our app. But what about _dynamic strings_? Our components often need to display content that includes some variables, based on things like the current user, the current date or time, etc. How do these variables factor in to our localization strategy?

Going back to our original `App` component, suppose we started with the following code:

```tsx
// src/components/App/App.tsx

import React from 'react';

import useUsername from '../../hooks/useUsername';

const App = () => {

  const username = useUsername()

  return (
    <div>
      {/* @TODO Localize me! */}
      <h1>Hello, {username}!</h1>
    </div>
  )

}
```

In this scenario, our display content is no longer static—it's parameterized by some `username` state.

### The `data` prop

The `I18n` component makes it easy to interpolate our localization content based on our state. To properly localized the "Hello, {username}!" string, we can leverage `I18n`'s `data` prop:

```tsx
<h1>
  <I18n k='components.App.greeting' data={{ username }}>
    {/* Hello, {username}! */}
  </I18n>
</h1>
```

When the `I18n` component is resolving a string to render, it checks whether or not we passed a `data` object; if so, it passes both the resolved string (effectively a template), together with `data`, to an interpolation function—which outputs an interpolated string value:

```ts
const result = interpolate(
  'Hello, {username}!',
  { username: 'Sam' }
)

// 'Hello, Sam!'
```

### Custom interpolation

The `react-i18n` library doesn't implement its own interpolation function; it also doesn't bundle a third-party interpolation package as a dependency. Instead, the library supports an `interpolate` setting that can be set to any suitable function via `setSettings()`. Without this setting enabled, `react-i18n` will not perform any interpolation on strings. This allows developers to choose any interpolation method they wish, while keeping `react-i18n` dependency-free.

```ts
// src/components/App/App.tsx

import pupa from 'pupa'

import { useI18nSettings } from 'react-i18n'

const App = () => {

  ...

  const [
    currentLanguage,
    setCurrentLanguage,
    settings,
    setSettings,
  ] = useI18nSettings()

  setSettings({
    interpolate: pupa,
  })

  ...

}
```

## Switching languages

Depending on your use case, you may need to give users the ability to change the display language on-the-fly while using your app, via some sort of language-picker.

You could leverage the `getSettings()` and `setCurrentLanguage` functions (returned by `useI18nSettings()`) to build this yourself and set up the correct event handlers—but this is a common enough need that `react-i18n` comes with its own `I18nLanguageSelect` component:

```tsx
<I18nLanguageSelect labels={{ en: 'English', fr: 'Français' }} />
```

The library makes no assumptions about which languages your app will support, or how you'd like those languages to be labeled in the UI. Therefore, it doesn't come bundled with an exhaustive set of language labels. Instead, the `I18nLanguageSelect` component takes a `labels` prop, which it uses to retrieve a human-friendly label for each of the languages included in `settings.supportedLanguages`.

The `I18nLanguageSelect` component renders a simple `select` element. The `select` includes an `onChange` handler that will trigger a call to `setCurrentLanguage()` whenever the user chooses a different option from the drop-down:

```tsx
<select value={currentLanguage}
  onChange={e => setCurrentLanguage(e.target.value)}>
  {
    settings.supportedLanguages.map(language => (
      <option key={language} value={language}>
        {labels[language as keyof typeof labels]}
      </option>
    ))
  }
</select>
```

## Configuration

Below is the complete list of settings supported by `setSettings({...})`:

```ts
// export const enum I18nLocaleIdentifiers {
//   English = `en_US`
// }

// export type I18nLocaleIdentifier = I18nLocaleIdentifiers.English|string;

interface I18nSettings {
  defaultLanguage: I18nLocaleIdentifier;
  preferredLanguage: I18nLocaleIdentifier;
  supportedLanguages: I18nLocaleIdentifier[];
  keyErrorMessage: string;
  getContentsURL:
    (language: I18nLocaleIdentifier, scope: string) => string;
  interpolate?: InterpolateFn;
  onChangeLanguage?:
    (language: I18nLocaleIdentifier) => void;
}
```

The `keyErrorMessage` setting allows developers to override the default error string that `I18n` renders if it failed to resolve a string from the given key. This setting defaults to the string `"%%_USE_I18N_STRING_ERROR_%%"`.

The `onChangeLanguage` setting lets developers easily run a callback whenever the current language changes. This is roughly equivalent to—but a bit easier than—setting up a `useEffect()` hook with `currentLanguage` as a dependency.

## Under the hood

For most React components, the `I18n` component is enough to localize content and perhaps interpolate that content with unique state. That being said, `react-i18n` also exposes a family of localization hooks that you can leverage to fit your needs.

### useI18nSettings()

Initializes the a new I18n context and returns its current settings, along with some setter functions:

```ts
// export type CurrentLanguage = I18nLocaleIdentifier;
// export type SetCurrentLanguageFn =
//   (language: I18nLocaleIdentifier) => void;
// export type Settings = I18nSettings;
// export type SetSettingsFn =
//   (partialSettings: Partial<I18nSettings>) => void;

export type UseI18nSettingsHookResult = [
  CurrentLanguage,
  SetCurrentLanguageFn,
  Settings,
  SetSettingsFn,
]

const useI18nSettings = (): UseI18nSettingsHookResult => {…}
```

This hook can be called multiple times in the same app, in order to created multiple, nested localization contexts. This can be very useful if you need to localize your app incrementally while continuously shipping new client builds to customers. Sections of your app that have not been localized yet can be wrapped in an `I18nSettingsContext` that restricts rendering to a single, fixed language (e.g., English).

### useI18nString()

Retrieves an individual string—or an entire tree of strings—based on current settings:

```ts
type UseI18nStringHookResult<T extends string|I18nCacheEntry = string> = [
  T|undefined,
  Error|undefined,
  boolean,
]

const useI18nString = <T extends string|I18nCacheEntry = string>(
  key: string,
  data?: any,
  ignoreMissing?: boolean): UseI18nStringHookResult<T> => {…}
```

The `I18nCacheEntry` type corresponds to any JSON object, or sub-object, that holds one or more key-value pairs. We'll discuss caching here shortly.

Under the hood, the `I18n` component passes our key `k` to `useI18nString()`, which uses `k`, together with `currentLanguage`, to asynchronously resolve the correct string in the correct language.

This hook is used primarily in instances where we need to use a localized string for something other than rendering (i.e., visible text). Common examples include HTML attributes like `src`, `alt`, and `aria-label`:

```tsx
import { useI18nString } from 'react-i18n'

const MyComponent = () => {

  const imageSrc = useI18nString('components.MyComponent.image.src')
  const imageAlt = useI18nString('components.MyComponent.image.alt')

  return (
    <img width="128" height="128"
      src={imageSrc[0] || `#`}
      alt={imageAlt[0] || `My cool image.`} />
  )

}
```

#### Dynamic keys

Similar to interpolating our localized strings with variables, we can also easily select particular _keys_ to fetch, simply by constructing our key on-demand

```tsx
import { useI18nString } from 'react-i18n'

const MyComponent = () => {

  const isDarkMode = window
    .matchMedia(`(prefers-color-scheme: dark)`)
    .matches

  const responsiveImageSrc = useI18nString(
    `components.MyComponent.image.src.${isDarkMode ? `dark` : `light` }`
  )

  return (
    <img width="128" height="128" alt="A responsive, localized image!"
      src={responsiveImageSrc[0] || `#`} />
  )

}
```

### useI18nMetadata()

Retrieves a set of localized values corresponding to several HTML metadata tags:

```ts
type UseI18nMetadataHookResult = {
  htmlLang: string;
  title: string;
  description: string;
}

const useI18nMetadata = (): UseI18nMetadataHookResult => {…}
```

The returned metadata object includes fields for `title` and `description`, as well as an `htmlLang` field corresponding to the `html` tag's `lang` attribute (which you may want to set whenever the current language changes).

While developers could always use the `useI18nString()` hook to resolve these strings separately, this is a common enough task that `useI18nMetadata()` is included as a convenience. The hook assumes that you follow the convention of storing your metadata strings under a scope named `meta` (e.g., `./static/languages/fr/meta.lang.json`).

The resulting map of localized key-value pairs can be used in conjunction with popular metadata-synchronizing packages, such as `react-helmet` and `next/head`.

### useI18nHtml()

Retrieves HTML content at a given URL:

```ts
type UseI18nHtmlHookResult = [
  string|undefined,
  Error|undefined,
  boolean
]

const useI18nHtml = (url: string): UseI18nHtmlHookResult => {…}
```

Sometimes we need our app to render entire chunks of static markup that is fetched from somewhere outside of our app. One example would be a static site headers. To localize this type of content, `react-i18n` offers a `useI18nHtml()` hook as a convenience. The hook is unaware of the current localization settings, because its only job is to asynchronously fetch markup from a URL you provide. React components that use this hook are responsible for passing an appropriate `url` based on the current language.

Below is an example of using this hook to render a dynamic site header—based on the current language—by fetching HTML content from a path on our server:

```tsx
import React from 'react';

import { I18nSettingsContext, useI18nHtml } from '@modules/react-i18n';

const AppHeader = () => {

  const [currentLanguage] = React.useContext(I18nSettingsContext)

  const url = `/shared-assets/html/header-${currentLanguage}.html`

  const [markup] = useI18nHtml(url)

  if(!markup)
  {
    return <></>
  }

  return (
    <div dangerouslySetInnerHTML={{ __html: markup }} />
  )

}
```

This `AppHeader` component could be generalized to a component that (1) accepts a `urls` map prop, in which languages are keys, and (2) renders the HTML fetched from the current language's path entry in `urls`.

### Caching

When localizing apps, it's likely that any JSON payloads we fetch off the network will be returned with certain cache headers (e.g., `Cache-Control`) that can affect how often a user's browser will re-fetch that resource.

This is likely to prevent our `useI18nString()` hook from issuing multiple requests for the same JSON file during a user's session. Still, `react-i18n` was designed with a simple caching layer to prevent re-fetches during any given session.

The `useI18nString()` hook makes use of a `useAsync()` hook that ships with the library. The `useAsync()` hook accepts an `async` callback that is expected to resolve to some `data`. The role of `useAsync()` is to return a tuple to the caller that includes:

1. The data, if available,
2. An `isPending` flag, to indicate if the callback is still resolving its data, and
3. An `Error`, if something went wrong.

```ts
type PromiseFn<T> = (...args: any[]) => Promise<T>;

type UseAsyncCallback<T> = {
  data: T|undefined;
  isPending: boolean;
  error: Error|undefined;
}

const useAsync = <T>(
  callback: PromiseFn<T>,
  immediate: boolean = true): UseAsyncCallback<T> => {…}
```

The `useI18nString()` hook uses a function named `getContent()` as its `useAsync()` callback. This is the function that actually _fetches_ JSON from the network, based on a given key `k`. This function is also responsible for maintaining an internal JSON cache. Objects in the cache are addressed by their `<language, scope>` pair.

```ts
const getContent = async <T extends string|I18nCacheEntry = string>(
  currentLanguage: I18nLocaleIdentifier,
  settings: I18nSettings,
  key: string,
  data?: any,
  ignoreMissing?: boolean): Promise<T|Error|undefined> => {…}
```

Whenever the `useI18nString()` hook delegates a call to `getContent()`, the `getContent()` function uses the `currentLanguage` argument, together with the `key` argument, to check for a corresponding entry in the JSON cache. If found, the function returns the cached content—a string, or a tree of strings—and skips a network call:

```ts
if(cacheEntry && cacheEntry[scope]) {

  cacheEntryPromise = cacheEntry[scope] as Promise<I18nCacheEntry>

} else {

  if(!cacheEntry)
  {
    cacheEntry = cache[currentLanguage] = {}
  }

  cacheEntryPromise = cacheEntry[scope] = fetch(url)
    .then((res) => res.json())
    .catch(() => undefined)

}
```

Cache items actually have the type `Promise<I18nCacheEntry>` instead of `I18nCacheEntry`. This setup prevents multiple instances of `useI18nString()` from triggering the same network call (for the same JSON) simultaneously, before any particular request has completed.

## Areas for improvement

Already, `react-i18n` offers a solid mix of ease-of-use and functionality; the simplicitly of React components and JSX, together with the `useI18nString()` hook, make localizing even the most minute details of your app relatively easy. Still, there is room for improvement.

### Configure on initialization

Currently, the `useI18nSettings()` hook takes zero arguments. The caller is expected to use the `setSettings()` function returned by the hook to customize the app's localization behavior. Since the `setSettings()` API is likely to be called only once (at application startup), it would be better if `useI18nSettings()` accepted some settings as an argument.

### Pre-fetch content

If an application allows a user to switch their display language on-the-fly (e.g., by offering an `I18nLanguageSelect` dropdown), the user would have to wait for the new language's JSON file(s) to be loaded off the network before new content can be displayed.

One way to reduce the wait-time is to pre-fetch JSON files for other supported languages in the background, based on the scopes that have already been accessed for the current language.

## Inspiration

Below are some similar libraries that inspired parts of this project:

- [`doshprompt/angular-localization`](https://github.com/doshprompt/angular-localization)
