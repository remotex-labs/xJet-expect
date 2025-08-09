/**
 * Imports
 */

import { isAsymmetric } from '@components/object.component';

/**
 * Default indentation string used throughout the serialization system.
 *
 * @remarks
 * This constant defines the standard indentation as two spaces ('  ') used
 * when generating multi-line serialized representations of complex data structures.
 * It's used as the default value for indent parameters across various serialization functions.
 *
 * @example
 * ```ts
 * // Using the default indentation
 * const serialized = serialize(complexObject);
 *
 * // Overriding with custom indentation
 * const customIndented = serialize(complexObject, '    '); // 4 spaces instead
 * ```
 *
 * @since 1.0.0
 */

const INDENT = '  ';

/**
 * Converts primitive JavaScript values to their string representation.
 *
 * @param element - The value to be serialized
 * @returns A string representation of the value, or null if serialization is not supported
 *
 * @remarks
 * This function handles serialization of various JavaScript primitive types and built-in objects:
 * - Strings (returns quoted string unless it contains newlines)
 * - Numbers (handles NaN and finite numbers)
 * - Booleans, Symbols, BigInts
 * - Functions (with name or as anonymous)
 * - null, undefined
 * - Built-in objects (Date, RegExp, Error, Promise)
 * - TypedArray views (ArrayBuffer, DataView)
 *
 * The function returns null for complex objects that require custom serialization
 * or for strings containing newlines, which should be handled differently.
 *
 * @example
 * ```ts
 * serializePrimitive("hello") // Returns: "\"hello\""
 * serializePrimitive(42) // Returns: "42"
 * serializePrimitive(null) // Returns: "null"
 * serializePrimitive(new Date()) // Returns: "[Date: 2023-05-01T00:00:00.000Z]"
 * serializePrimitive({}) // Returns: null (complex objects not handled)
 * ```
 *
 * @see serialize - For complete object serialization including complex objects
 *
 * @since 1.0.0
 */

export function serializePrimitive(element: unknown): string | null {
    if (typeof element === 'string') return element.includes('\n') ? null : `"${ element }"`;
    if (typeof element === 'number') return `${ Number.isFinite(element) ? element : element.toString() }`;
    if (typeof element === 'boolean') return `${ element }`;
    if (typeof element === 'symbol') return `${ element.toString() }`;
    if (typeof element === 'bigint') return `${ element }n`;
    if (typeof element === 'function') return `[Function: ${ element.name || 'anonymous' }]`;

    if (element === null) return 'null';
    if (element === undefined) return 'undefined';
    if (isAsymmetric(element)) return element.expectedLabel ?? element.constructor.name;
    if (element instanceof Date) return `[Date: ${ element.toISOString() }]`;
    if (element instanceof RegExp) return element.toString();
    if (element instanceof Error) return `[${ element.name }: ${ element.message }]`;
    if (element instanceof Promise) return '[Promise <pending>]';
    if (element instanceof ArrayBuffer) return `ArrayBuffer { byteLength: ${ element.byteLength } }`;
    if (element instanceof DataView) {
        return `DataView { byteLength: ${ element.byteLength }, byteOffset: ${ element.byteOffset } }`;
    }

    return null;
}

/**
 * Provides a string representation of Map keys for serialization purposes.
 *
 * @param key - The Map key to be converted to a string
 * @returns A consistent string representation of the key
 *
 * @remarks
 * This utility function ensures consistent string representation of Map keys
 * when serializing Map objects for display or comparison purposes:
 *
 * - Special handling for null and undefined values
 * - Uses class/type information for object keys via Object.prototype.toString
 * - Properly quotes and escapes string values using JSON.stringify
 *
 * The function is particularly useful when working with Maps containing
 * complex keys that need to be represented in a human-readable format.
 *
 * @example
 * ```ts
 * // When serializing a Map:
 * const map = new Map([[{id: 1}, 'value'], ['key2', 123]]);
 *
 * const entries = Array.from(map.entries()).map(([key, value]) => {
 *   return `${serializeMapKey(key)} => ${serializePrimitive(value) || '...'}`;
 * });
 *
 * // Results in: ["[object Object] => \"value\"", "\"key2\" => 123"]
 * ```
 *
 * @see serialize - For complete object serialization
 *
 * @since 1.0.0
 */

export function serializeMapKey(key: unknown): string {
    if (key === null) return 'null';
    if (key === undefined) return 'undefined';
    if (typeof key === 'object') return Object.prototype.toString.call(key);

    return JSON.stringify(key);
}

/**
 * Appends formatted lines from a source array to a target array with proper indentation and separators.
 *
 * @param source - Array of strings to be appended
 * @param target - Array where the formatted lines will be added
 * @param key - Prefix to be added to the first line
 * @param isLast - Whether this is the last element in a sequence (affects comma placement)
 * @param indent - String used for indentation (default is empty string)
 * @returns void - Modifies the target array in place
 *
 * @remarks
 * This utility function handles the formatting logic when appending multi-line content
 * to a string array representation of a structured object. It properly handles:
 * - Adding the key prefix only to the first line
 * - Applying consistent indentation to all lines
 * - Adding trailing commas to non-last elements
 * - Special handling for single-line and empty source arrays
 *
 * The function is particularly useful for serializing object properties or array elements
 * that span multiple lines while maintaining proper structure formatting.
 *
 * @example
 * ```ts
 * const source = ["{", "  value: 42", "}"];
 * const target = [];
 *
 * appendLines(source, target, "property: ", false, "  ");
 * // Results in target containing:
 * // ["  property: {", "    value: 42", "  },"]
 *
 * appendLines(["simple"], target, "last: ", true, "  ");
 * // Adds: ["  last: simple"]
 * ```
 *
 * @since 1.0.0
 */

export function appendLines(source: Array<string>, target: Array<string>, key: string, isLast: boolean, indent: string = ''): void {
    if (source.length === 0) return;
    if (source.length < 2) {
        const last = `${ indent }${ key }${ source[source.length - 1] }`;
        target.push(isLast ? last : `${ last },`);

        return;
    }

    target.push(`${ indent }${ key }${ source[0] }`);
    for (let i = 1; i < source.length - 1; i++) {
        target.push(indent + source[i]);
    }

    const last = `${ indent }${ source[source.length - 1] }`;
    target.push(isLast ? last : `${ last },`);
}

/**
 * Serializes a JavaScript Map object into a multi-line string representation.
 *
 * @param map - The Map object to serialize
 * @param lines - Array of strings where the serialized representation will be added
 * @param indent - String used for indentation of nested structures
 * @param seen - Set of objects that have already been serialized (used to detect circular references)
 * @returns void - Modifies the line's array in place
 *
 * @remarks
 * This function converts a Map object into a human-readable string representation
 * with proper formatting and indentation. The serialization process:
 *
 * 1. Handles empty Maps with a compact `Map {}` representation
 * 2. For non-empty Maps, creates a multi-line representation with each entry on separate lines
 * 3. Formats each entry as `key => value` with proper serialization of both key and value
 * 4. Preserves complex structure of nested values through recursive serialization
 * 5. Applies consistent indentation for nested structures
 *
 * The output format is similar to Node.js console.log representation of Maps
 * but with enhanced formatting for nested structures.
 *
 * @example
 * ```ts
 * const map = new Map([
 *   ["key1", "value1"],
 *   [42, {nested: true}]
 * ]);
 * const result = [];
 *
 * serializeMap(map, result, "  ");
 * // the result now contains:
 * // ["Map {",
 * //   "\"key1\" => \"value1\",",
 * //   "42 => {",
 * //   "  nested: true",
 * //   "}",
 * // "}"]
 * ```
 *
 * @see serializeMapKey - Function used to serialize Map keys
 * @see serializeValue - Function used to serialize Map values
 * @see appendLines - Helper for handling multi-line formatting
 *
 * @since 1.0.0
 */

export function serializeMap(map: Map<unknown, unknown>, lines: Array<string>, indent: string, seen: WeakSet<object>): void {
    if (map.size === 0) {
        lines.push('Map {}');

        return;
    }

    lines.push('Map {');
    const entries = Array.from(map.entries());
    entries.forEach(([ key, val ], i) => {
        const keyStr = serializeMapKey(key);
        const subLines: Array<string> = [];
        serializeValue(val, subLines, indent, seen);
        appendLines(subLines, lines, `${ keyStr } => `, i === entries.length - 1, indent);
    });
    lines.push('}');
}

/**
 * Serializes a JavaScript array into a multi-line string representation.
 *
 * @param arr - The array to be serialized
 * @param lines - Array of strings where the serialized representation will be added
 * @param indent - String used for indentation of nested structures
 * @param seen - Set of objects that have already been serialized (used to detect circular references)
 * @returns void - Modifies the line's array in place
 *
 * @remarks
 * This function converts an array into a human-readable string representation
 * with proper formatting and indentation. The serialization follows these rules:
 *
 * 1. Empty arrays are represented as the compact string "Array []"
 * 2. Non-empty arrays are formatted with each element on a separate line
 * 3. Each element is properly serialized based on its type
 * 4. Nested structures (objects, arrays, maps) maintain consistent indentation
 * 5. The format is similar to Node.js console.log representation but with enhanced readability
 *
 * The function is designed to work with arrays containing elements of any type,
 * including complex nested structures, by recursively serializing each element.
 *
 * @example
 * ```ts
 * const array = [1, "text", {a: true}, [2, 3]];
 * const result = [];
 *
 * serializeArray(array, result, "  ");
 * // the result now contains:
 * // ["Array [",
 * //   "1,",
 * //   "\"text\",",
 * //   "{",
 * //   "  a: true",
 * //   "},",
 * //   "Array [",
 * //   "  2,",
 * //   "  3",
 * //   "]",
 * // "]"]
 * ```
 *
 * @see serializeValue - Function used to serialize individual array elements
 * @see appendLines - Helper for handling multi-line formatting
 *
 * @since 1.0.0
 */

export function serializeArray(arr: Array<unknown>, lines: Array<string>, indent: string, seen: WeakSet<object>): void {
    if (arr.length === 0) {
        lines.push('[]');

        return;
    }

    lines.push('[');
    arr.forEach((item, i) => {
        const subLines: Array<string> = [];
        serializeValue(item, subLines, indent, seen);
        appendLines(subLines, lines, '', i === arr.length - 1, indent);
    });
    lines.push(']');
}

/**
 * Serializes a JavaScript Set object into a multi-line string representation.
 *
 * @param set - The Set object to serialize
 * @param lines - Array of strings where the serialized representation will be added
 * @param indent - String used for indentation of nested structures
 * @param seen - Set of objects that have already been serialized (used to detect circular references)
 * @returns void - Modifies the line's array in place
 *
 * @remarks
 * This function converts a Set object into a human-readable string representation
 * with proper formatting and indentation. The serialization process:
 *
 * 1. Handles empty Sets with a compact `Set {}` representation
 * 2. For non-empty Sets, creates a multi-line representation with each value on separate lines
 * 3. Properly serializes each value based on its type
 * 4. Preserves complex structure of nested values through recursive serialization
 * 5. Applies consistent indentation for nested structures
 *
 * Since Sets maintain insertion order in JavaScript, the serialized output will
 * reflect this order, displaying elements in the sequence they were added to the Set.
 *
 * @example
 * ```ts
 * const set = new Set([1, "text", {a: true}, [2, 3]]);
 * const result = [];
 *
 * serializeSet(set, result, "  ");
 * // the result now contains:
 * // ["Set {",
 * //   "1,",
 * //   "\"text\",",
 * //   "{",
 * //   "  a: true",
 * //   "},",
 * //   "Array [",
 * //   "  2,",
 * //   "  3",
 * //   "]",
 * // "}"]
 * ```
 *
 * @see serializeValue - Function used to serialize individual Set values
 * @see appendLines - Helper for handling multi-line formatting
 *
 * @since 1.0.0
 */

export function serializeSet(set: Set<unknown>, lines: Array<string>, indent: string, seen: WeakSet<object>): void {
    if (set.size === 0) {
        lines.push('Set {}');

        return;
    }

    lines.push('Set {');
    const arr = Array.from(set);
    arr.forEach((item, i) => {
        const subLines: Array<string> = [];
        serializeValue(item, subLines, indent, seen);
        appendLines(subLines, lines, '', i === arr.length - 1, indent);
    });
    lines.push('}');
}

/**
 * Serializes a Node.js Buffer object into a multi-line string representation.
 *
 * @param arr - The Buffer object to serialize
 * @param lines - Array of strings where the serialized representation will be added
 * @param indent - String used for indentation of nested structures
 * @returns void - Modifies the line's array in place
 *
 * @remarks
 * This function converts a Buffer object into a human-readable string representation
 * with proper formatting and indentation. The serialization process:
 *
 * 1. Handles empty Buffers with a compact `Buffer {}` representation
 * 2. For non-empty Buffers, creates a multi-line representation with each byte value on separate lines
 * 3. Shows numeric byte values without any conversion to characters
 * 4. Adds trailing commas to all bytes except the last one
 * 5. Maintains a consistent indentation level for all byte values
 *
 * The function first converts the Buffer to an array of numeric values to ensure
 * consistent handling of byte data regardless of the Buffer implementation.
 *
 * @example
 * ```ts
 * const buffer = Buffer.from([104, 101, 108, 108, 111]); // "hello" in ASCII
 * const result = [];
 *
 * serializeBuffer(buffer, result, "  ");
 * // the result now contains:
 * // ["Buffer {",
 * //   "  104,",
 * //   "  101,",
 * //   "  108,",
 * //   "  108,",
 * //   "  111",
 * // "}"]
 * ```
 *
 * @since 1.0.0
 */

export function serializeBuffer(arr: Buffer, lines: Array<string>, indent: string): void {
    const values = Array.from(arr as unknown as Array<number>);
    if (values.length === 0) {
        lines.push('Buffer {}');

        return;
    }

    lines.push('Buffer {');
    for (let i = 0; i < values.length; i++) {
        const val = values[i];
        const comma = i === values.length - 1 ? '' : ',';

        lines.push(`${ indent }${ val }${ comma }`);
    }
    lines.push('}');
}

/**
 * Serializes a JavaScript TypedArray object into a multi-line string representation.
 *
 * @param arr - The ArrayBufferView (TypedArray) object to serialize
 * @param lines - Array of strings where the serialized representation will be added
 * @param indent - String used for indentation of nested structures
 * @returns void - Modifies the line's array in place
 *
 * @remarks
 * This function converts any TypedArray (such as Int8Array, Uint8Array, Float32Array, etc.)
 * into a human-readable string representation with proper formatting and indentation.
 * The serialization process:
 *
 * 1. Dynamically determines the specific TypedArray type using Object.prototype.toString
 * 2. Handles empty TypedArrays with a compact `{TypeName} []` representation
 * 3. For non-empty TypedArrays, creates a multi-line representation with each numeric value on separate lines
 * 4. Adds trailing commas to all values except the last one
 * 5. Maintains consistent indentation for all values
 *
 * The function first converts the TypedArray to a standard array of numeric values
 * to ensure consistent handling across different TypedArray implementations.
 *
 * @example
 * ```ts
 * const int32Array = new Int32Array([42, 100, -5]);
 * const result = [];
 *
 * serializeTypedArray(int32Array, result, "  ");
 * // the result now contains:
 * // ["Int32Array [",
 * //   "  42,",
 * //   "  100,",
 * //   "  -5",
 * // "]"]
 * ```
 *
 * @since 1.0.0
 */

export function serializeTypedArray(arr: ArrayBufferView, lines: Array<string>, indent: string): void {
    const name = Object.prototype.toString.call(arr).slice(8, -1);
    const values = Array.from(arr as unknown as Array<number>);
    if (values.length === 0) {
        lines.push(`${ name } []`);

        return;
    }

    lines.push(`${ name } [`);
    for (let i = 0; i < values.length; i++) {
        const val = values[i];
        const comma = i === values.length - 1 ? '' : ',';

        lines.push(`${ indent }${ val }${ comma }`);
    }
    lines.push(']');
}

/**
 * Serializes a JavaScript object into a multi-line string representation.
 *
 * @param obj - The object to serialize
 * @param lines - Array of strings where the serialized representation will be added
 * @param indent - String used for indentation of nested structures
 * @param seen - Set of objects that have already been serialized (used to detect circular references)
 * @returns void - Modifies the line's array in place
 *
 * @remarks
 * This function converts an object into a human-readable string representation
 * with proper formatting and indentation. The serialization process:
 *
 * 1. Includes the constructor name in the output (e.g., `Date {}` instead of just `{}`)
 * 2. Falls back to "Object" if the constructor is not available or is the base Object constructor
 * 3. Handles empty objects with a compact `{ConstructorName} {}` representation
 * 4. For non-empty objects, creates a multi-line representation with each property on separate lines
 * 5. Formats each property as "key: value" with proper indentation
 * 6. Serializes property values recursively to handle nested objects and complex values
 *
 * The function uses Object.entries() to list own enumerable properties,
 * which means non-enumerable properties and those in the prototype chain will not be included.
 *
 * @example
 * ```ts
 * const object = {
 *   name: "example",
 *   count: 42,
 *   nested: { flag: true }
 * };
 * const result = [];
 *
 * serializeObject(object, result, "  ");
 * // the result now contains:
 * // ["Object {",
 * //   "  name: \"example\",",
 * //   "  count: 42,",
 * //   "nested: Object {",
 * //   "    flag: true",
 * //   "  }",
 * // "}"]
 * ```
 *
 * @see serializeValue - Function used to serialize property values
 * @see appendLines - Helper for handling multi-line formatting
 *
 * @since 1.0.0
 */

export function serializeObject(obj: object, lines: Array<string>, indent: string, seen: WeakSet<object>): void {
    const name = obj.constructor && obj.constructor !== Object ? obj.constructor.name : 'Object';
    const entries = Object.entries(obj);
    if (entries.length === 0) {
        lines.push(`${ name } {}`);

        return;
    }

    lines.push(`${ name } {`);
    entries.forEach(([ key, val ], i) => {
        const subLines: Array<string> = [];
        serializeValue(val, subLines, indent, seen);
        appendLines(subLines, lines, `${ String(key) }: `, i === entries.length - 1, indent);
    });
    lines.push('}');
}

/**
 * Serializes any JavaScript value into a human-readable string representation.
 *
 * @param value - The value to serialize (can be of any type)
 * @param lines - Array of strings where the serialized representation will be added
 * @param indent - String used for indentation of nested structures (defaults to a predefined indent value)
 * @param seen - Set of objects that have already been serialized (used to detect circular references)
 * @returns void - Modifies the line's array in place
 *
 * @remarks
 * This function serves as the main entry point for the serialization system, dispatching
 * to specialized serializers based on the value type. The serialization process:
 *
 * 1. First attempts to serialize primitive values (null, undefined, booleans, numbers, symbols)
 * 2. Handles multi-line strings with special formatting - each line is properly indented
 * 3. Uses specialized serializers for common complex types:
 *    - Maps
 *    - Arrays
 *    - Sets
 *    - Buffers
 *    - TypedArrays (Int8Array, Uint8Array, Float32Array, etc.)
 * 4. Falls back to object serialization for any other non-primitive values
 *
 * The function generates a clear, structured representation that maintains the
 * hierarchical relationships between nested objects and preserves type information.
 *
 * @example
 * ```ts
 * const complexValue = {
 *   name: "example",
 *   numbers: [1, 2, 3],
 *   settings: new Map([["active", true], ["mode", "advanced"]]),
 *   data: new Uint8Array([10, 20, 30])
 * };
 *
 * const result = [];
 * serializeValue(complexValue, result);
 * // result contains a multi-line representation of the entire object structure
 * ```
 *
 * @see serializePrimitive - Helper for handling primitive values
 * @see serializeMap - Helper for serializing Map objects
 * @see serializeArray - Helper for serializing Arrays
 * @see serializeSet - Helper for serializing Sets
 * @see serializeBuffer - Helper for serializing Buffers
 * @see serializeTypedArray - Helper for serializing TypedArrays
 * @see serializeObject - Helper for serializing generic objects
 *
 * @since 1.0.0
 */

export function serializeValue(value: unknown, lines: Array<string>, indent: string = INDENT, seen: WeakSet<object>): void {
    const primitive = serializePrimitive(value);
    if (primitive !== null) {
        lines.push(primitive);

        return;
    }

    // Handle multi-line strings
    if (typeof value === 'string') {
        const stringLines = value.split('\n');
        lines.push('String "'); // opening quote line
        for (const line of stringLines) {
            lines.push(`${ indent }${ line }`);
        }
        lines.push('"'); // closing quote line

        return;
    }

    if (typeof value === 'object' && value !== null) {
        if (seen.has(<object> value)) {
            lines.push('[Circular]');

            return;
        }

        seen.add(<object> value);

        if (value instanceof Map) {
            serializeMap(value, lines, indent, seen);
        } else if (Array.isArray(value)) {
            serializeArray(value, lines, indent, seen);
        } else if (value instanceof Set) {
            serializeSet(value, lines, indent, seen);
        } else if (value instanceof Buffer) {
            serializeBuffer(value, lines, indent);
        } else if (ArrayBuffer.isView(value) && !(value instanceof DataView)) {
            serializeTypedArray(value, lines, indent);
        } else {
            serializeObject(value as object, lines, indent, seen);
        }

        return;
    }

    serializeObject(value as object, lines, indent, seen);
}

/**
 * Serializes an error object into a plain object containing its enumerable properties and common error fields.
 *
 * @param error - The error value to serialize.
 *
 * @returns A plain object with the error's enumerable properties and the `name`, `message`, and `stack` fields if available.
 * Returns the original value if it is not an object.
 *
 * @remarks
 * This function copies all own enumerable properties from the provided error,
 * ensuring that the `name`, `message`, and `stack` fields are preserved even if they are non-enumerable.
 * If the input is not an object, it is returned unchanged.
 *
 * @example
 * ```ts
 * const err = new Error('Something went wrong');
 * const serialized = serializeError(err);
 * // {
 * //   name: 'Error',
 * //   message: 'Something went wrong',
 * //   stack: 'Error: Something went wrong\n    at ...'
 * // }
 *
 * const notAnError = 'oops';
 * serializeError(notAnError); // 'oops'
 * ```
 *
 * @since 1.0.0
 */

export function serializeError(error: Record<string, unknown> | unknown): Record<string, unknown> | unknown {
    if (error && typeof error === 'object') {
        if('toJSON' in error && typeof error.toJSON === 'function') {
            return error.toJSON();
        }

        const json: Record<string, unknown> = {};

        for (const [ key, value ] of Object.entries(error)) {
            if (value !== undefined) {
                json[key] = value;
            }
        }

        json.name = (error as { name?: unknown })?.name ?? json.name;
        json.message = (error as { message?: unknown })?.message ?? json.message;
        json.stack = (error as { stack?: unknown })?.stack ?? json.stack;

        return json;
    }

    return error;
}

/**
 * Converts any JavaScript value into an array of strings representing its serialized form.
 *
 * @param element - The value to serialize (can be of any type)
 * @param indent - String used for indentation of nested structures (defaults to a predefined indent value)
 * @returns Array of strings containing the serialized representation
 *
 * @remarks
 * This function serves as a convenient public API for the serialization system.
 * It creates an empty array, delegates the actual serialization work to the
 * specialized `serializeValue` function, and returns the resulting array of
 * string lines.
 *
 * Each element in the returned array represents a single line in the serialized
 * output, with proper indentation and formatting already applied. This makes it
 * easy to either join the lines for display or process them individually.
 *
 * Unlike direct use of `serializeValue`, this function handles the creation and
 * management of the output array, simplifying the API for consumers.
 *
 * @example
 * ```ts
 * // Serialize a simple object
 * const obj = { name: "example", values: [1, 2, 3] };
 * const lines = serialize(obj);
 * console.log(lines.join('\n'));
 * // Output:
 * // Object {
 * //   name: "example",
 * //   values: Array [
 * //     1,
 * //     2,
 * //     3
 * //   ]
 * // }
 * ```
 *
 * @see serializeValue - The underlying function that performs the actual serialization
 *
 * @since 1.0.0
 */

export function serialize(element: unknown, indent: string = INDENT): Array<string> {
    const lines: Array<string> = [];
    serializeValue(element, lines, indent, new WeakSet());

    return lines;
}
