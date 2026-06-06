# Number Matchers

Number matchers assert numeric relationships - ordering comparisons and floating-point tolerance.

| Matcher                  | Passes when the value is     |
|--------------------------|------------------------------|
| `toBeGreaterThan`        | Strictly greater than `n`    |
| `toBeGreaterThanOrEqual` | Greater than or equal to `n` |
| `toBeLessThan`           | Strictly less than `n`       |
| `toBeLessThanOrEqual`    | Less than or equal to `n`    |
| `toBeCloseTo`            | Within a tolerance of `n`    |

## toBeCloseTo

Checks that a number is approximately equal to the target, within a precision expressed in decimal places. Use it
for floating-point arithmetic, where exact equality is unreliable.

```ts
xExpect(value).toBeCloseTo(expected, precision?);
```

- `expected` - the target number to compare against.
- `precision` *(optional)* - the number of decimal places to check. Defaults to `2`.

```ts
// Default precision (2 decimal places)
xExpect(0.1 + 0.2).toBeCloseTo(0.3);

// Custom precision
xExpect(0.1234).toBeCloseTo(0.123, 3);
xExpect(0.1234).not.toBeCloseTo(0.123, 4);

// Negative numbers
xExpect(-1.23).toBeCloseTo(-1.2, 1);
```

::: info How the tolerance is computed
The allowed difference is `10 ^ -precision / 2`, and the check passes when `|actual - expected| < tolerance`.
Higher precision means a tighter tolerance.
:::

## toBeGreaterThan

Checks that the value is strictly greater than the expected value.

```ts
xExpect(10).toBeGreaterThan(5);
xExpect(5).not.toBeGreaterThan(5);
xExpect(-1).toBeGreaterThan(-2);
```

## toBeGreaterThanOrEqual

Checks that the value is greater than or equal to the expected value.

```ts
xExpect(10).toBeGreaterThanOrEqual(10);
xExpect(10).toBeGreaterThanOrEqual(5);
xExpect(5).not.toBeGreaterThanOrEqual(10);
```

## toBeLessThan

Checks that the value is strictly less than the expected value.

```ts
xExpect(5).toBeLessThan(10);
xExpect(5).not.toBeLessThan(5);
xExpect(-2).toBeLessThan(-1);
```

## toBeLessThanOrEqual

Checks that the value is less than or equal to the expected value.

```ts
xExpect(10).toBeLessThanOrEqual(10);
xExpect(5).toBeLessThanOrEqual(10);
xExpect(10).not.toBeLessThanOrEqual(5);
```

::: tip Bounding a range
Combine the comparison matchers to assert a value falls within a range:

```ts
xExpect(value).toBeGreaterThanOrEqual(0);
xExpect(value).toBeLessThan(100);
```

:::

## See also

- [Equality matchers](/matchers/equality) - `toBeNaN` and exact numeric equality
- [Asymmetric matchers](/guide/asymmetric) - `xExpect.closeTo()` inside larger structures
