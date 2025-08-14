/**
 * Represents any numeric value supported by xJet matchers.
 *
 * - `number` — Standard JavaScript number.
 * - `bigint` — Arbitrary precision integer.
 *
 * @remarks
 * Used for numeric comparisons in matchers such as `toBeGreaterThan`, `toBeLessThan`, etc.
 *
 * @since 1.0.0
 */

export type NumericType = number | bigint;

/**
 * Represents the comparison operators supported by numeric matchers.
 *
 * - `'>'`  — Greater than
 * - `'>='` — Greater than or equal to
 * - `'<'`  — Less than
 * - `'<='` — Less than or equal to
 *
 * @remarks
 * Used internally to perform numeric comparisons in matcher logic.
 *
 * @see handleNumericComparison
 *
 * @since 1.0.0
 */

export type NumberOperatorType = '>' | '<' | '>=' | '<=';
