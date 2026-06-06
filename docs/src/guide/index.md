---
outline: deep
---

# Getting Started

**xJet-Expect** is the assertion library for the [xJet](https://github.com/remotex-labs/xJet) test runner. It
provides a fluent, Jest-compatible matcher API - `xExpect(value).toBe(...)` - with deep equality, asymmetric
matchers, mock introspection, and colorized failure diffs, all written in TypeScript.

## Installation

::: code-group

```bash [npm]
npm install --save-dev @remotex-labs/xjet-expect
```

```bash [pnpm]
pnpm add -D @remotex-labs/xjet-expect
```

```bash [yarn]
yarn add --dev @remotex-labs/xjet-expect
```

:::

xJet-Expect requires Node.js 20 or later.

## Your first assertion

```ts
test('two plus two', () => {
    xExpect(2 + 2).toBe(4);
});
```

When this runs under the xJet test runner, the assertion passes silently. If `2 + 2` were anything but `4`, xJet
would print a diff of the expected and received values and fail the test.

::: tip Globals provided by the runner
Inside the xJet runner, `test`, `describe`, `expect`, and the `xJet` mock namespace are available globally - no
imports needed. The global `expect` **is** `xExpect`, so the two are interchangeable. Import `xExpect` explicitly
only when you use it outside a test file:

```ts
import { xExpect } from '@remotex-labs/xjet-expect';
```

:::

## The assertion model

Every assertion follows the same shape: wrap the value under test in `xExpect(...)`, then chain a *matcher* that
states what you expect.

```ts
xExpect(received).toEqual(expected);
//      ^actual    ^matcher ^expected
```

A *matcher* is the check itself (`toBe`, `toEqual`, `toContain`, ...). A *modifier* sits in front of a matcher to
adapt it - `.not` inverts it, and `.resolves` / `.rejects` unwrap a Promise first.

```ts
xExpect(value).not.toBeNull();
await xExpect(promise).resolves.toBe('ok');
```

## Matchers by category

Matchers are grouped by the kind of value they operate on. Each category has its own page with a quick-reference
table and worked examples.

| Category                              | Covers                                            |
|---------------------------------------|---------------------------------------------------|
| [Equality](/matchers/equality)        | Identity, deep equality, presence, and truthiness |
| [Numbers](/matchers/numbers)          | Comparisons and floating-point tolerance          |
| [Strings](/matchers/strings)          | Length, substrings, and patterns                  |
| [Objects & Arrays](/matchers/objects) | Properties, type, and partial structure           |
| [Functions](/matchers/functions)      | Asserting that a call throws                      |
| [Mocks & Spies](/matchers/mocks)      | Calls, arguments, and return values               |

Two features cut across every category:

- [**Modifiers**](/guide/modifiers) - `.not`, `.resolves`, and `.rejects`.
- [**Asymmetric matchers**](/guide/asymmetric) - match a *shape* (`xExpect.any()`, `xExpect.objectContaining()`)
  instead of an exact value.

## Reading a failure

When an assertion fails, xJet prints a diff. Lines marked `-` are what was **expected**; lines marked `+` are what
was **received**.

```text
Expected: 42
Received: 41

  Object {
-   "count": 2,
+   "count": 3,
    "name": "test",
  }
```

## Next steps

- Learn the [modifiers](/guide/modifiers) that adapt any matcher.
- Match flexible shapes with [asymmetric matchers](/guide/asymmetric).
- Browse the matcher reference, starting with [Equality](/matchers/equality).
