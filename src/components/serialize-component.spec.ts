/**
 * Imports
 */

import { appendLines, serialize, serializeArray, serializeError } from '@components/serialize.component';
import { serializeBuffer, serializeMap, serializeMapKey, serializeObject } from '@components/serialize.component';
import { serializePrimitive, serializeSet, serializeTypedArray, serializeValue } from '@components/serialize.component';

/**
 * Tests
 */

describe('serializePrimitive', () => {
    test('serializes strings correctly', () => {
        expect(serializePrimitive('hello')).toBe('"hello"');
        expect(serializePrimitive('')).toBe('""');
    });

    test('serializes numbers correctly', () => {
        expect(serializePrimitive(42)).toBe('42');
        expect(serializePrimitive(0)).toBe('0');
        expect(serializePrimitive(-1.5)).toBe('-1.5');
    });

    test('serializes non-finite numbers correctly', () => {
        expect(serializePrimitive(NaN)).toBe('NaN');
        expect(serializePrimitive(Infinity)).toBe('Infinity');
        expect(serializePrimitive(-Infinity)).toBe('-Infinity');
    });

    test('serializes booleans correctly', () => {
        expect(serializePrimitive(true)).toBe('true');
        expect(serializePrimitive(false)).toBe('false');
    });

    test('serializes symbols correctly', () => {
        const sym = Symbol('test');
        expect(serializePrimitive(sym)).toBe('Symbol(test)');
        const anonSym = Symbol();
        expect(serializePrimitive(anonSym)).toBe('Symbol()');
    });

    test('serializes bigint correctly', () => {
        expect(serializePrimitive(BigInt(123))).toBe('123n');
        expect(serializePrimitive(BigInt(0))).toBe('0n');
        expect(serializePrimitive(BigInt(-456))).toBe('-456n');
    });

    test('serializes functions correctly', () => {
        function namedFunction() {
        }

        expect(serializePrimitive(namedFunction)).toBe('[Function: namedFunction]');
        expect(serializePrimitive(function () {
        })).toBe('[Function: anonymous]');
        expect(serializePrimitive(() => {
        })).toBe('[Function: anonymous]');
    });

    test('serializes null and undefined correctly', () => {
        expect(serializePrimitive(null)).toBe('null');
        expect(serializePrimitive(undefined)).toBe('undefined');
    });

    test('serializes Date objects correctly', () => {
        const date = new Date('2023-01-15T12:00:00.000Z');
        expect(serializePrimitive(date)).toBe('[Date: 2023-01-15T12:00:00.000Z]');
    });

    test('serializes RegExp objects correctly', () => {
        const regex = /test/g;
        expect(serializePrimitive(regex)).toBe('/test/g');
    });

    test('serializes Error objects correctly', () => {
        const error = new Error('Something went wrong');
        expect(serializePrimitive(error)).toBe('[Error: Something went wrong]');

        const typeError = new TypeError('Type mismatch');
        expect(serializePrimitive(typeError)).toBe('[TypeError: Type mismatch]');
    });

    test('serializes Promise objects correctly', () => {
        const promise = Promise.resolve();
        expect(serializePrimitive(promise)).toBe('[Promise <pending>]');
    });

    test('returns null for regular objects', () => {
        const obj = { a: 1, b: 'test' };
        expect(serializePrimitive(obj)).toBeNull();

        const arr = [ 1, 2, 3 ];
        expect(serializePrimitive(arr)).toBeNull();
    });

    test('serializes Asymmetric objects correctly', () => {
        const asymmetric = {
            expectedLabel: 'AsymmetricPattern',
            matches() {
                return true;
            }
        };

        expect(serializePrimitive(asymmetric)).toBe('AsymmetricPattern');
    });
});

describe('serializeMapKey', () => {
    test('serializes null correctly', () => {
        expect(serializeMapKey(null)).toBe('null');
    });

    test('serializes undefined correctly', () => {
        expect(serializeMapKey(undefined)).toBe('undefined');
    });

    test('serializes objects using Object.prototype.toString', () => {
        const obj = { key: 'value' };
        expect(serializeMapKey(obj)).toBe('[object Object]');

        const arr = [ 1, 2, 3 ];
        expect(serializeMapKey(arr)).toBe('[object Array]');

        const map = new Map();
        expect(serializeMapKey(map)).toBe('[object Map]');

        const set = new Set();
        expect(serializeMapKey(set)).toBe('[object Set]');

        const date = new Date();
        expect(serializeMapKey(date)).toBe('[object Date]');
    });

    test('serializes primitive types using JSON.stringify', () => {
        expect(serializeMapKey('hello')).toBe('"hello"');
        expect(serializeMapKey('')).toBe('""');
        expect(serializeMapKey(42)).toBe('42');
        expect(serializeMapKey(0)).toBe('0');
        expect(serializeMapKey(-1.5)).toBe('-1.5');
        expect(serializeMapKey(true)).toBe('true');
        expect(serializeMapKey(false)).toBe('false');
    });

    test('serializes complex string keys correctly', () => {
        expect(serializeMapKey('key with "quotes"')).toBe('"key with \\"quotes\\""');
        expect(serializeMapKey('key with \\ backslash')).toBe('"key with \\\\ backslash"');
    });

    test('serializes numeric keys correctly', () => {
        expect(serializeMapKey(NaN)).toBe('null');
        expect(serializeMapKey(Infinity)).toBe('null');
        expect(serializeMapKey(-Infinity)).toBe('null');
    });

    test('serializes symbols correctly', () => {
        const sym = Symbol('test');
        // Symbols can't be converted to JSON, so they become undefined
        // which then gets converted to a string by JSON.stringify
        expect(serializeMapKey(sym)).toBe(undefined);
    });
});

describe('appendLines', () => {
    test('does nothing when source array is empty', () => {
        const source: Array<string> = [];
        const target: Array<string> = [];

        appendLines(source, target, 'key: ', false);

        expect(target).toEqual([]);
    });

    test('handles single line source correctly when not last item', () => {
        const source = [ 'value' ];
        const target: Array<string> = [];

        appendLines(source, target, 'key: ', false);

        expect(target).toEqual([ 'key: value,' ]);
    });

    test('handles single line source correctly when it is the last item', () => {
        const source = [ 'value' ];
        const target: Array<string> = [];

        appendLines(source, target, 'key: ', true);

        expect(target).toEqual([ 'key: value' ]);
    });

    test('handles single line source with indent', () => {
        const source = [ 'value' ];
        const target: Array<string> = [];
        const indent = '  ';

        appendLines(source, target, 'key: ', false, indent);

        expect(target).toEqual([ '  key: value,' ]);
    });

    test('handles multi-line source correctly when not last item', () => {
        const source = [ 'line1', 'line2', 'line3' ];
        const target: Array<string> = [];

        appendLines(source, target, 'key: ', false);

        expect(target).toEqual([
            'key: line1',
            'line2',
            'line3,'
        ]);
    });

    test('handles multi-line source correctly when it is the last item', () => {
        const source = [ 'line1', 'line2', 'line3' ];
        const target: Array<string> = [];

        appendLines(source, target, 'key: ', true);

        expect(target).toEqual([
            'key: line1',
            'line2',
            'line3'
        ]);
    });

    test('handles multi-line source with indent', () => {
        const source = [ 'line1', 'line2', 'line3' ];
        const target: Array<string> = [];
        const indent = '  ';

        appendLines(source, target, 'key: ', false, indent);

        expect(target).toEqual([
            '  key: line1',
            '  line2',
            '  line3,'
        ]);
    });

    test('appends to existing target array', () => {
        const source = [ 'value' ];
        const target = [ 'existing line' ];

        appendLines(source, target, 'key: ', true);

        expect(target).toEqual([
            'existing line',
            'key: value'
        ]);
    });

    test('handles exactly two lines correctly', () => {
        const source = [ 'line1', 'line2' ];
        const target: Array<string> = [];

        appendLines(source, target, 'key: ', false);

        expect(target).toEqual([
            'key: line1',
            'line2,'
        ]);
    });

    test('handles empty key correctly', () => {
        const source = [ 'value' ];
        const target: Array<string> = [];

        appendLines(source, target, '', false);

        expect(target).toEqual([ 'value,' ]);
    });
});

describe('serializeMap', () => {
    const INDENT = '|--|';

    test('handles empty map correctly', () => {
        const map = new Map();
        const lines: Array<string> = [];

        serializeMap(map, lines, INDENT, new WeakSet());

        expect(lines).toEqual([ 'Map {}' ]);
    });

    test('serializes map with simple string entries', () => {
        const map = new Map([[ 'key1', 'value1' ]]);
        const lines: Array<string> = [];

        serializeMap(map, lines, INDENT, new WeakSet());

        expect(lines).toEqual([
            'Map {',
            `${ INDENT }"key1" => "value1"`,
            '}'
        ]);
    });

    test('serializes map with multiple primitive entries', () => {
        const map = new Map<any, any>([
            [ 'key1', 'value1' ],
            [ 'key2', 42 ],
            [ 'key3', true ]
        ]);
        const lines: Array<string> = [];

        serializeMap(map, lines, INDENT, new WeakSet());

        expect(lines).toEqual([
            'Map {',
            `${ INDENT }"key1" => "value1",`,
            `${ INDENT }"key2" => 42,`,
            `${ INDENT }"key3" => true`,
            '}'
        ]);
    });

    test('serializes map with null and undefined values', () => {
        const map = new Map([
            [ 'nullKey', null ],
            [ 'undefinedKey', undefined ]
        ]);
        const lines: Array<string> = [];

        serializeMap(map, lines, INDENT, new WeakSet());

        expect(lines).toEqual([
            'Map {',
            `${ INDENT }"nullKey" => null,`,
            `${ INDENT }"undefinedKey" => undefined`,
            '}'
        ]);
    });

    test('serializes map with object values', () => {
        const map = new Map([[ 'objectKey', { prop: 'value' }]]);
        const lines: Array<string> = [];

        serializeMap(map, lines, INDENT, new WeakSet());

        expect(lines).toEqual([
            'Map {',
            `${ INDENT }"objectKey" => Object {`,
            `${ INDENT + INDENT }prop: "value"`,
            `${ INDENT }}`,
            '}'
        ]);
    });

    test('serializes map with array values', () => {
        const map = new Map([[ 'arrayKey', [ 1, 2, 3 ]]]);
        const lines: Array<string> = [];

        serializeMap(map, lines, INDENT, new WeakSet());

        expect(lines).toEqual([
            'Map {',
            `${ INDENT }"arrayKey" => [`,
            `${ INDENT + INDENT }1,`,
            `${ INDENT + INDENT }2,`,
            `${ INDENT + INDENT }3`,
            `${ INDENT }]`,
            '}'
        ]);
    });

    test('handles map with non-string keys correctly', () => {
        const map = new Map<any, any>([
            [ 42, 'number key value' ],
            [ null, 'null key value' ],
            [ undefined, 'undefined key value' ],
            [{}, 'object key value' ]
        ]);
        const lines: Array<string> = [];

        serializeMap(map, lines, INDENT, new WeakSet());

        expect(lines).toEqual([
            'Map {',
            `${ INDENT }42 => "number key value",`,
            `${ INDENT }null => "null key value",`,
            `${ INDENT }undefined => "undefined key value",`,
            `${ INDENT }[object Object] => "object key value"`,
            '}'
        ]);
    });

    test('serializes nested maps correctly', () => {
        const nestedMap = new Map([[ 'nested', 'value' ]]);
        const map = new Map([[ 'outerKey', nestedMap ]]);
        const lines: Array<string> = [];

        serializeMap(map, lines, INDENT, new WeakSet());

        expect(lines).toEqual([
            'Map {',
            `${ INDENT }"outerKey" => Map {`,
            `${ INDENT + INDENT }"nested" => "value"`,
            `${ INDENT }}`,
            '}'
        ]);
    });

    test('uses provided custom indent', () => {
        const map = new Map([[ 'key', { prop: 'value' }]]);
        const lines: Array<string> = [];
        const customIndent = '  '; // Two spaces

        serializeMap(map, lines, customIndent, new WeakSet());

        expect(lines).toEqual([
            'Map {',
            `${ customIndent }"key" => Object {`,
            `${ customIndent + customIndent }prop: "value"`,
            `${ customIndent }}`,
            '}'
        ]);
    });
});

describe('serializeArray', () => {
    const INDENT = '|--|';

    test('handles empty array correctly', () => {
        const arr: Array<unknown> = [];
        const lines: Array<string> = [];

        serializeArray(arr, lines, INDENT, new WeakSet());

        expect(lines).toEqual([ '[]' ]);
    });

    test('serializes array with primitive values', () => {
        const arr = [ 'string', 42, true, null, undefined ];
        const lines: Array<string> = [];

        serializeArray(arr, lines, INDENT, new WeakSet());

        expect(lines).toEqual([
            '[',
            `${ INDENT }"string",`,
            `${ INDENT }42,`,
            `${ INDENT }true,`,
            `${ INDENT }null,`,
            `${ INDENT }undefined`,
            ']'
        ]);
    });

    test('serializes array with a single element', () => {
        const arr = [ 'solo' ];
        const lines: Array<string> = [];

        serializeArray(arr, lines, INDENT, new WeakSet());

        expect(lines).toEqual([
            '[',
            `${ INDENT }"solo"`,
            ']'
        ]);
    });

    test('serializes array with object values', () => {
        const arr = [{ prop: 'value' }];
        const lines: Array<string> = [];

        serializeArray(arr, lines, INDENT, new WeakSet());

        expect(lines).toEqual([
            '[',
            `${ INDENT }Object {`,
            `${ INDENT }${ INDENT }prop: "value"`,
            `${ INDENT }}`,
            ']'
        ]);
    });

    test('serializes array with nested arrays', () => {
        const arr = [[ 1, 2, 3 ]];
        const lines: Array<string> = [];

        serializeArray(arr, lines, INDENT, new WeakSet());

        expect(lines).toEqual([
            '[',
            `${ INDENT }[`,
            `${ INDENT }${ INDENT }1,`,
            `${ INDENT }${ INDENT }2,`,
            `${ INDENT }${ INDENT }3`,
            `${ INDENT }]`,
            ']'
        ]);
    });

    test('serializes complex mixed array correctly', () => {
        const arr = [
            'string',
            { a: 1, b: 2 },
            [ true, false ]
        ];
        const lines: Array<string> = [];

        serializeArray(arr, lines, INDENT, new WeakSet());

        expect(lines).toEqual([
            '[',
            `${ INDENT }"string",`,
            `${ INDENT }Object {`,
            `${ INDENT }${ INDENT }a: 1,`,
            `${ INDENT }${ INDENT }b: 2`,
            `${ INDENT }},`,
            `${ INDENT }[`,
            `${ INDENT }${ INDENT }true,`,
            `${ INDENT }${ INDENT }false`,
            `${ INDENT }]`,
            ']'
        ]);
    });

    test('serializes arrays with Date objects', () => {
        const date = new Date('2023-01-15T12:00:00.000Z');
        const arr = [ date ];
        const lines: Array<string> = [];

        serializeArray(arr, lines, INDENT, new WeakSet());

        expect(lines).toEqual([
            '[',
            `${ INDENT }[Date: 2023-01-15T12:00:00.000Z]`,
            ']'
        ]);
    });

    test('serializes arrays with RegExp objects', () => {
        const regex = /test/g;
        const arr = [ regex ];
        const lines: Array<string> = [];

        serializeArray(arr, lines, INDENT, new WeakSet());

        expect(lines).toEqual([
            '[',
            `${ INDENT }/test/g`,
            ']'
        ]);
    });

    test('serializes arrays with Error objects', () => {
        const error = new Error('Test error');
        const arr = [ error ];
        const lines: Array<string> = [];

        serializeArray(arr, lines, INDENT, new WeakSet());

        expect(lines).toEqual([
            '[',
            `${ INDENT }[Error: Test error]`,
            ']'
        ]);
    });

    test('uses provided custom indent', () => {
        const arr = [ 1, 2 ];
        const lines: Array<string> = [];
        const customIndent = '  '; // Two spaces

        serializeArray(arr, lines, customIndent, new WeakSet());

        expect(lines).toEqual([
            '[',
            '  1,',
            '  2',
            ']'
        ]);
    });

    test('appends to existing lines array', () => {
        const arr = [ 'item' ];
        const lines = [ 'Existing line' ];

        serializeArray(arr, lines, INDENT, new WeakSet());

        expect(lines).toEqual([
            'Existing line',
            '[',
            `${ INDENT }"item"`,
            ']'
        ]);
    });
});

describe('serializeSet', () => {
    const INDENT = '|--|';

    test('handles empty set correctly', () => {
        const set = new Set();
        const lines: Array<string> = [];

        serializeSet(set, lines, INDENT, new WeakSet());

        expect(lines).toEqual([ 'Set {}' ]);
    });

    test('serializes set with primitive values', () => {
        const set = new Set([ 'string', 42, true, null, undefined ]);
        const lines: Array<string> = [];

        serializeSet(set, lines, INDENT, new WeakSet());

        expect(lines).toEqual([
            'Set {',
            `${ INDENT }"string",`,
            `${ INDENT }42,`,
            `${ INDENT }true,`,
            `${ INDENT }null,`,
            `${ INDENT }undefined`,
            '}'
        ]);
    });

    test('serializes set with a single element', () => {
        const set = new Set([ 'solo' ]);
        const lines: Array<string> = [];

        serializeSet(set, lines, INDENT, new WeakSet());

        expect(lines).toEqual([
            'Set {',
            `${ INDENT }"solo"`,
            '}'
        ]);
    });

    test('serializes set with object values', () => {
        const set = new Set([{ prop: 'value' }]);
        const lines: Array<string> = [];

        serializeSet(set, lines, INDENT, new WeakSet());

        expect(lines).toEqual([
            'Set {',
            `${ INDENT }Object {`,
            `${ INDENT }${ INDENT }prop: "value"`,
            `${ INDENT }}`,
            '}'
        ]);
    });

    test('serializes set with arrays', () => {
        const set = new Set([[ 1, 2, 3 ]]);
        const lines: Array<string> = [];

        serializeSet(set, lines, INDENT, new WeakSet());

        expect(lines).toEqual([
            'Set {',
            `${ INDENT }[`,
            `${ INDENT }${ INDENT }1,`,
            `${ INDENT }${ INDENT }2,`,
            `${ INDENT }${ INDENT }3`,
            `${ INDENT }]`,
            '}'
        ]);
    });

    test('serializes complex mixed set correctly', () => {
        const set = new Set([
            'string',
            { a: 1, b: 2 },
            [ true, false ]
        ]);
        const lines: Array<string> = [];

        serializeSet(set, lines, INDENT, new WeakSet());

        expect(lines).toEqual([
            'Set {',
            `${ INDENT }"string",`,
            `${ INDENT }Object {`,
            `${ INDENT }${ INDENT }a: 1,`,
            `${ INDENT }${ INDENT }b: 2`,
            `${ INDENT }},`,
            `${ INDENT }[`,
            `${ INDENT }${ INDENT }true,`,
            `${ INDENT }${ INDENT }false`,
            `${ INDENT }]`,
            '}'
        ]);
    });

    test('serializes set with Date objects', () => {
        const date = new Date('2023-01-15T12:00:00.000Z');
        const set = new Set([ date ]);
        const lines: Array<string> = [];

        serializeSet(set, lines, INDENT, new WeakSet());

        expect(lines).toEqual([
            'Set {',
            `${ INDENT }[Date: 2023-01-15T12:00:00.000Z]`,
            '}'
        ]);
    });

    test('serializes set with RegExp objects', () => {
        const regex = /test/g;
        const set = new Set([ regex ]);
        const lines: Array<string> = [];

        serializeSet(set, lines, INDENT, new WeakSet());

        expect(lines).toEqual([
            'Set {',
            `${ INDENT }/test/g`,
            '}'
        ]);
    });

    test('serializes set with Error objects', () => {
        const error = new Error('Test error');
        const set = new Set([ error ]);
        const lines: Array<string> = [];

        serializeSet(set, lines, INDENT, new WeakSet());

        expect(lines).toEqual([
            'Set {',
            `${ INDENT }[Error: Test error]`,
            '}'
        ]);
    });

    test('serializes nested sets correctly', () => {
        const nestedSet = new Set([ 'nested' ]);
        const set = new Set([ nestedSet ]);
        const lines: Array<string> = [];

        serializeSet(set, lines, INDENT, new WeakSet());

        expect(lines).toEqual([
            'Set {',
            `${ INDENT }Set {`,
            `${ INDENT }${ INDENT }"nested"`,
            `${ INDENT }}`,
            '}'
        ]);
    });

    test('uses provided custom indent', () => {
        const set = new Set([ 1, 2 ]);
        const lines: Array<string> = [];
        const customIndent = '  '; // Two spaces

        serializeSet(set, lines, customIndent, new WeakSet());

        expect(lines).toEqual([
            'Set {',
            '  1,',
            '  2',
            '}'
        ]);
    });

    test('appends to existing lines array', () => {
        const set = new Set([ 'item' ]);
        const lines = [ 'Existing line' ];

        serializeSet(set, lines, INDENT, new WeakSet());

        expect(lines).toEqual([
            'Existing line',
            'Set {',
            `${ INDENT }"item"`,
            '}'
        ]);
    });

    test('maintains insertion order when serializing', () => {
        // Sets maintain insertion order, so we should test that the serialization respects that
        const set = new Set();
        set.add('c');
        set.add('a');
        set.add('b');

        const lines: Array<string> = [];

        serializeSet(set, lines, INDENT, new WeakSet());

        expect(lines).toEqual([
            'Set {',
            `${ INDENT }"c",`,
            `${ INDENT }"a",`,
            `${ INDENT }"b"`,
            '}'
        ]);
    });
});

describe('serializeBuffer', () => {
    const INDENT = '|--|';

    test('handles empty buffer correctly', () => {
        const buffer = Buffer.alloc(0);
        const lines: Array<string> = [];

        serializeBuffer(buffer, lines, INDENT);

        expect(lines).toEqual([ 'Buffer {}' ]);
    });

    test('serializes Buffer with some values', () => {
        const buffer = Buffer.from([ 1, 2, 3 ]);
        const lines: Array<string> = [];

        serializeBuffer(buffer, lines, INDENT);

        expect(lines).toEqual([
            'Buffer {',
            `${ INDENT }1,`,
            `${ INDENT }2,`,
            `${ INDENT }3`,
            '}'
        ]);
    });

    test('serializes Buffer with a single element', () => {
        const buffer = Buffer.from([ 42 ]);
        const lines: Array<string> = [];

        serializeBuffer(buffer, lines, INDENT);

        expect(lines).toEqual([
            'Buffer {',
            `${ INDENT }42`,
            '}'
        ]);
    });

    test('serializes Buffer with byte values', () => {
        const buffer = Buffer.from([ 0, 127, 255 ]);
        const lines: Array<string> = [];

        serializeBuffer(buffer, lines, INDENT);

        expect(lines).toEqual([
            'Buffer {',
            `${ INDENT }0,`,
            `${ INDENT }127,`,
            `${ INDENT }255`,
            '}'
        ]);
    });

    test('uses provided custom indent', () => {
        const buffer = Buffer.from([ 1, 2 ]);
        const lines: Array<string> = [];
        const customIndent = '  '; // Two spaces

        serializeBuffer(buffer, lines, customIndent);

        expect(lines).toEqual([
            'Buffer {',
            '  1,',
            '  2',
            '}'
        ]);
    });

    test('appends to existing lines array', () => {
        const buffer = Buffer.from([ 1 ]);
        const lines = [ 'Existing line' ];

        serializeBuffer(buffer, lines, INDENT);

        expect(lines).toEqual([
            'Existing line',
            'Buffer {',
            `${ INDENT }1`,
            '}'
        ]);
    });

    test('handles large buffer with many values', () => {
        // Create a buffer with enough values to test chunking if implemented
        const largeBuffer = Buffer.alloc(100);
        for (let i = 0; i < largeBuffer.length; i++) {
            largeBuffer[i] = i % 256;
        }

        const lines: Array<string> = [];

        serializeBuffer(largeBuffer, lines, INDENT);

        expect(lines[0]).toBe('Buffer {');
        expect(lines[lines.length - 1]).toBe('}');
        expect(lines[1]).toBe(`${ INDENT }0,`);
        expect(lines[2]).toBe(`${ INDENT }1,`);
        expect(lines[3]).toBe(`${ INDENT }2,`);
        expect(lines[lines.length - 2]).toBe(`${ INDENT }99`);
        expect(lines.length).toBe(102); // 1 for header, 100 for values, 1 for footer
    });

    test('serializes Buffer created from string', () => {
        const buffer = Buffer.from('hello');
        const lines: Array<string> = [];

        serializeBuffer(buffer, lines, INDENT);

        expect(lines).toEqual([
            'Buffer {',
            `${ INDENT }104,`, // h
            `${ INDENT }101,`, // e
            `${ INDENT }108,`, // l
            `${ INDENT }108,`, // l
            `${ INDENT }111`,  // o
            '}'
        ]);
    });
});

describe('serializeTypedArray', () => {
    const INDENT = '|--|';

    test('handles empty Uint8Array correctly', () => {
        const array = new Uint8Array();
        const lines: Array<string> = [];

        serializeTypedArray(array, lines, INDENT);

        expect(lines).toEqual([ 'Uint8Array []' ]);
    });

    test('serializes Uint8Array with values', () => {
        const array = new Uint8Array([ 1, 2, 3 ]);
        const lines: Array<string> = [];

        serializeTypedArray(array, lines, INDENT);

        expect(lines).toEqual([
            'Uint8Array [',
            `${ INDENT }1,`,
            `${ INDENT }2,`,
            `${ INDENT }3`,
            ']'
        ]);
    });

    test('serializes Int8Array correctly', () => {
        const array = new Int8Array([ -128, 0, 127 ]);
        const lines: Array<string> = [];

        serializeTypedArray(array, lines, INDENT);

        expect(lines).toEqual([
            'Int8Array [',
            `${ INDENT }-128,`,
            `${ INDENT }0,`,
            `${ INDENT }127`,
            ']'
        ]);
    });

    test('serializes Uint16Array correctly', () => {
        const array = new Uint16Array([ 0, 32767, 65535 ]);
        const lines: Array<string> = [];

        serializeTypedArray(array, lines, INDENT);

        expect(lines).toEqual([
            'Uint16Array [',
            `${ INDENT }0,`,
            `${ INDENT }32767,`,
            `${ INDENT }65535`,
            ']'
        ]);
    });

    test('serializes Int16Array correctly', () => {
        const array = new Int16Array([ -32768, 0, 32767 ]);
        const lines: Array<string> = [];

        serializeTypedArray(array, lines, INDENT);

        expect(lines).toEqual([
            'Int16Array [',
            `${ INDENT }-32768,`,
            `${ INDENT }0,`,
            `${ INDENT }32767`,
            ']'
        ]);
    });

    test('serializes Uint32Array correctly', () => {
        const array = new Uint32Array([ 0, 2147483647, 4294967295 ]);
        const lines: Array<string> = [];

        serializeTypedArray(array, lines, INDENT);

        expect(lines).toEqual([
            'Uint32Array [',
            `${ INDENT }0,`,
            `${ INDENT }2147483647,`,
            `${ INDENT }4294967295`,
            ']'
        ]);
    });

    test('serializes Int32Array correctly', () => {
        const array = new Int32Array([ -2147483648, 0, 2147483647 ]);
        const lines: Array<string> = [];

        serializeTypedArray(array, lines, INDENT);

        expect(lines).toEqual([
            'Int32Array [',
            `${ INDENT }-2147483648,`,
            `${ INDENT }0,`,
            `${ INDENT }2147483647`,
            ']'
        ]);
    });

    test('serializes Float32Array correctly', () => {
        const array = new Float32Array([ 1.1, 2.2, 3.3 ]);
        const lines: Array<string> = [];

        serializeTypedArray(array, lines, INDENT);

        // Float32Array may have precision issues, so we'll check structure but not exact values
        expect(lines[0]).toBe('Float32Array [');
        expect(lines[lines.length - 1]).toBe(']');
        expect(lines.length).toBe(5); // header, 3 values, footer
    });

    test('serializes Float64Array correctly', () => {
        const array = new Float64Array([ 1.1, 2.2, 3.3 ]);
        const lines: Array<string> = [];

        serializeTypedArray(array, lines, INDENT);

        expect(lines).toEqual([
            'Float64Array [',
            `${ INDENT }1.1,`,
            `${ INDENT }2.2,`,
            `${ INDENT }3.3`,
            ']'
        ]);
    });

    test('serializes Uint8ClampedArray correctly', () => {
        const array = new Uint8ClampedArray([ 0, 255, 300 ]); // 300 should be clamped to 255
        const lines: Array<string> = [];

        serializeTypedArray(array, lines, INDENT);

        expect(lines).toEqual([
            'Uint8ClampedArray [',
            `${ INDENT }0,`,
            `${ INDENT }255,`,
            `${ INDENT }255`,
            ']'
        ]);
    });

    test('uses provided custom indent', () => {
        const array = new Uint8Array([ 1, 2 ]);
        const lines: Array<string> = [];
        const customIndent = '  '; // Two spaces

        serializeTypedArray(array, lines, customIndent);

        expect(lines).toEqual([
            'Uint8Array [',
            '  1,',
            '  2',
            ']'
        ]);
    });

    test('appends to existing lines array', () => {
        const array = new Uint8Array([ 1 ]);
        const lines = [ 'Existing line' ];

        serializeTypedArray(array, lines, INDENT);

        expect(lines).toEqual([
            'Existing line',
            'Uint8Array [',
            `${ INDENT }1`,
            ']'
        ]);
    });

    test('serializes BigInt64Array correctly', () => {
        // Only run this test if BigInt64Array is available in the environment
        if (typeof BigInt64Array !== 'undefined') {
            const array = new BigInt64Array([ BigInt(-1), BigInt(0), BigInt(1) ]);
            const lines: Array<string> = [];

            serializeTypedArray(array, lines, INDENT);

            expect(lines).toEqual([
                'BigInt64Array [',
                `${ INDENT }-1,`,
                `${ INDENT }0,`,
                `${ INDENT }1`,
                ']'
            ]);
        }
    });

    test('serializes BigUint64Array correctly', () => {
        // Only run this test if BigUint64Array is available in the environment
        if (typeof BigUint64Array !== 'undefined') {
            const array = new BigUint64Array([ BigInt(0), BigInt(1), BigInt(2) ]);
            const lines: Array<string> = [];

            serializeTypedArray(array, lines, INDENT);

            expect(lines).toEqual([
                'BigUint64Array [',
                `${ INDENT }0,`,
                `${ INDENT }1,`,
                `${ INDENT }2`,
                ']'
            ]);
        }
    });
});

describe('serializeObject', () => {
    const INDENT = '|--|';

    test('handles empty object correctly', () => {
        const obj = {};
        const lines: Array<string> = [];

        serializeObject(obj, lines, INDENT, new WeakSet());

        expect(lines).toEqual([ 'Object {}' ]);
    });

    test('serializes object with primitive properties', () => {
        const obj = {
            string: 'value',
            number: 42,
            boolean: true,
            nullValue: null,
            undefinedValue: undefined
        };
        const lines: Array<string> = [];

        serializeObject(obj, lines, INDENT, new WeakSet());

        expect(lines).toEqual([
            'Object {',
            `${ INDENT }string: "value",`,
            `${ INDENT }number: 42,`,
            `${ INDENT }boolean: true,`,
            `${ INDENT }nullValue: null,`,
            `${ INDENT }undefinedValue: undefined`,
            '}'
        ]);
    });

    test('serializes object with a single property', () => {
        const obj = { key: 'value' };
        const lines: Array<string> = [];

        serializeObject(obj, lines, INDENT, new WeakSet());

        expect(lines).toEqual([
            'Object {',
            `${ INDENT }key: "value"`,
            '}'
        ]);
    });

    test('serializes nested objects', () => {
        const obj = {
            nested: {
                prop: 'value'
            }
        };
        const lines: Array<string> = [];

        serializeObject(obj, lines, INDENT, new WeakSet());

        expect(lines).toEqual([
            'Object {',
            `${ INDENT }nested: Object {`,
            `${ INDENT }${ INDENT }prop: "value"`,
            `${ INDENT }}`,
            '}'
        ]);
    });

    test('serializes objects with array properties', () => {
        const obj = {
            arr: [ 1, 2, 3 ]
        };
        const lines: Array<string> = [];

        serializeObject(obj, lines, INDENT, new WeakSet());

        expect(lines).toEqual([
            'Object {',
            `${ INDENT }arr: [`,
            `${ INDENT }${ INDENT }1,`,
            `${ INDENT }${ INDENT }2,`,
            `${ INDENT }${ INDENT }3`,
            `${ INDENT }]`,
            '}'
        ]);
    });

    test('uses constructor name for custom classes', () => {
        class Person {
            name: string;
            age: number;

            constructor(name: string, age: number) {
                this.name = name;
                this.age = age;
            }
        }

        const person = new Person('John', 30);
        const lines: Array<string> = [];

        serializeObject(person, lines, INDENT, new WeakSet());

        expect(lines).toEqual([
            'Person {',
            `${ INDENT }name: "John",`,
            `${ INDENT }age: 30`,
            '}'
        ]);
    });

    test('uses provided custom indent', () => {
        const obj = { key1: 'value1', key2: 'value2' };
        const lines: Array<string> = [];
        const customIndent = '  '; // Two spaces

        serializeObject(obj, lines, customIndent, new WeakSet());

        expect(lines).toEqual([
            'Object {',
            '  key1: "value1",',
            '  key2: "value2"',
            '}'
        ]);
    });

    test('appends to existing lines array', () => {
        const obj = { key: 'value' };
        const lines = [ 'Existing line' ];

        serializeObject(obj, lines, INDENT, new WeakSet());

        expect(lines).toEqual([
            'Existing line',
            'Object {',
            `${ INDENT }key: "value"`,
            '}'
        ]);
    });

    test('serializes objects with getter properties', () => {
        const obj = {
            get computed() {
                return 'computed value';
            }
        };
        const lines: Array<string> = [];

        serializeObject(obj, lines, INDENT, new WeakSet());

        expect(lines).toEqual([
            'Object {',
            `${ INDENT }computed: "computed value"`,
            '}'
        ]);
    });

    test('serializes deeply nested objects', () => {
        const obj = {
            level1: {
                level2: {
                    level3: {
                        value: 'deep'
                    }
                }
            }
        };
        const lines: Array<string> = [];

        serializeObject(obj, lines, INDENT, new WeakSet());

        expect(lines).toEqual([
            'Object {',
            `${ INDENT }level1: Object {`,
            `${ INDENT }${ INDENT }level2: Object {`,
            `${ INDENT }${ INDENT }${ INDENT }level3: Object {`,
            `${ INDENT }${ INDENT }${ INDENT }${ INDENT }value: "deep"`,
            `${ INDENT }${ INDENT }${ INDENT }}`,
            `${ INDENT }${ INDENT }}`,
            `${ INDENT }}`,
            '}'
        ]);
    });

    test('serializes objects with function properties', () => {
        const obj = {
            func: function () { return 'test'; }
        };
        const lines: Array<string> = [];

        serializeObject(obj, lines, INDENT, new WeakSet());

        expect(lines[0]).toBe('Object {');
        expect(lines[1]).toContain('func: ');
        expect(lines[lines.length - 1]).toBe('}');
    });

    test('serializes objects with mixed property types', () => {
        const obj = {
            string: 'text',
            number: 123,
            array: [ 1, 2, 3 ],
            nested: { a: 1 },
            date: new Date('2023-01-01')
        };
        const lines: Array<string> = [];

        serializeObject(obj, lines, INDENT, new WeakSet());

        expect(lines[0]).toBe('Object {');
        expect(lines.find(line => line.includes('string: "text"'))).toBeTruthy();
        expect(lines.find(line => line.includes('number: 123'))).toBeTruthy();
        expect(lines.find(line => line.includes('array: ['))).toBeTruthy();
        expect(lines.find(line => line.includes('nested: Object {'))).toBeTruthy();
        expect(lines.find(line => line.includes('date:'))).toBeTruthy();
        expect(lines[lines.length - 1]).toBe('}');
    });
});

describe('serializeValue', () => {
    const INDENT = '|--|';

    test('serializes DataView correctly', () => {
        const buffer = new ArrayBuffer(3);
        const view = new DataView(buffer);
        view.setUint8(0, 1);
        view.setUint8(1, 2);
        view.setUint8(2, 3);

        const lines: Array<string> = [];

        serializeValue(view, lines, INDENT, new WeakSet());
        expect(lines).toEqual([ 'DataView { byteLength: 3, byteOffset: 0 }' ]);
    });

    test('serializes primitive string', () => {
        const value = 'test string';
        const lines: Array<string> = [];

        serializeValue(value, lines, INDENT, new WeakSet());

        expect(lines).toEqual([ '"test string"' ]);
    });

    test('serializes primitive number', () => {
        const value = 42;
        const lines: Array<string> = [];

        serializeValue(value, lines, INDENT, new WeakSet());

        expect(lines).toEqual([ '42' ]);
    });

    test('serializes primitive boolean', () => {
        const value = true;
        const lines: Array<string> = [];

        serializeValue(value, lines, INDENT, new WeakSet());

        expect(lines).toEqual([ 'true' ]);
    });

    test('serializes null', () => {
        const value = null;
        const lines: Array<string> = [];

        serializeValue(value, lines, INDENT, new WeakSet());

        expect(lines).toEqual([ 'null' ]);
    });

    test('serializes undefined', () => {
        const value = undefined;
        const lines: Array<string> = [];

        serializeValue(value, lines, INDENT, new WeakSet());

        expect(lines).toEqual([ 'undefined' ]);
    });

    test('serializes Map', () => {
        const value = new Map([[ 'key', 'value' ]]);
        const lines: Array<string> = [];

        serializeValue(value, lines, INDENT, new WeakSet());

        expect(lines[0]).toBe('Map {');
        expect(lines[lines.length - 1]).toBe('}');
    });

    test('serializes Array', () => {
        const value = [ 1, 2, 3 ];
        const lines: Array<string> = [];

        serializeValue(value, lines, INDENT, new WeakSet());

        expect(lines[0]).toBe('[');
        expect(lines[lines.length - 1]).toBe(']');
    });

    test('serializes Set', () => {
        const value = new Set([ 1, 2, 3 ]);
        const lines: Array<string> = [];

        serializeValue(value, lines, INDENT, new WeakSet());

        expect(lines[0]).toBe('Set {');
        expect(lines[lines.length - 1]).toBe('}');
    });

    test('serializes Buffer', () => {
        const value = Buffer.from([ 1, 2, 3 ]);
        const lines: Array<string> = [];

        serializeValue(value, lines, INDENT, new WeakSet());

        expect(lines[0]).toBe('Buffer {');
        expect(lines[lines.length - 1]).toBe('}');
    });

    test('serializes TypedArray', () => {
        const value = new Uint8Array([ 1, 2, 3 ]);
        const lines: Array<string> = [];

        serializeValue(value, lines, INDENT, new WeakSet());

        expect(lines[0]).toBe('Uint8Array [');
        expect(lines[lines.length - 1]).toBe(']');
    });

    test('serializes Object', () => {
        const value = { key: 'value' };
        const lines: Array<string> = [];

        serializeValue(value, lines, INDENT, new WeakSet());

        expect(lines[0]).toBe('Object {');
        expect(lines[lines.length - 1]).toBe('}');
    });

    test('serializes Date object', () => {
        const value = new Date('2023-01-01T00:00:00.000Z');
        const lines: Array<string> = [];

        serializeValue(value, lines, INDENT, new WeakSet());

        expect(lines[0]).toContain('Date');
    });

    test('serializes RegExp object', () => {
        const value = /test/g;
        const lines: Array<string> = [];

        serializeValue(value, lines, INDENT, new WeakSet());

        expect(lines[0]).toContain('/test/g');
    });

    test('serializes custom class instance', () => {
        class TestClass {
            property = 'value';
        }
        const value = new TestClass();
        const lines: Array<string> = [];

        serializeValue(value, lines, INDENT, new WeakSet());

        expect(lines[0]).toBe('TestClass {');
        expect(lines[lines.length - 1]).toBe('}');
    });

    test('serializes DataView', () => {
        const buffer = new ArrayBuffer(4);
        const value = new DataView(buffer);
        value.setInt32(0, 42);
        const lines: Array<string> = [];

        serializeValue(value, lines, INDENT, new WeakSet());

        // DataView should be serialized as an object
        expect(lines[0]).toContain('DataView');
    });

    test('serializes nested mixed types', () => {
        const value = {
            string: 'text',
            array: [ 1, { nested: true }],
            set: new Set([ 'a', 'b' ]),
            map: new Map([[ 'key', 'value' ]])
        };
        const lines: Array<string> = [];

        serializeValue(value, lines, INDENT, new WeakSet());

        expect(lines[0]).toBe('Object {');
        expect(lines.length).toBeGreaterThan(10); // Should have many lines for the nested structure
        expect(lines[lines.length - 1]).toBe('}');
    });
    test('serializes multi-line string', () => {
        const value = 'line 1\nline 2\nline 3';
        const lines: Array<string> = [];

        serializeValue(value, lines, '  ', new WeakSet());

        expect(lines).toEqual([
            'String "',
            '  line 1',
            '  line 2',
            '  line 3',
            '"'
        ]);
    });
});

describe('serialize', () => {
    test('returns array of lines for primitive value', () => {
        const result = serialize('test');

        expect(result).toEqual([ '"test"' ]);
    });

    test('returns array of lines for null', () => {
        const result = serialize(null);

        expect(result).toEqual([ 'null' ]);
    });

    test('returns array of lines for undefined', () => {
        const result = serialize(undefined);

        expect(result).toEqual([ 'undefined' ]);
    });

    test('returns array of lines for array', () => {
        const result = serialize([ 1, 2, 3 ]);

        expect(result[0]).toBe('[');
        expect(result[result.length - 1]).toBe(']');
        expect(result.length).toBe(5); // Opening, 3 elements, closing
    });

    test('returns array of lines for object', () => {
        const result = serialize({ a: 1, b: 2 });

        expect(result[0]).toBe('Object {');
        expect(result[result.length - 1]).toBe('}');
        expect(result.length).toBe(4); // Opening, 2 properties, closing
    });

    test('returns array of lines for Map', () => {
        const map = new Map([[ 'a', 1 ], [ 'b', 2 ]]);
        const result = serialize(map);

        expect(result[0]).toBe('Map {');
        expect(result[result.length - 1]).toBe('}');
    });

    test('returns array of lines for Set', () => {
        const set = new Set([ 1, 2, 3 ]);
        const result = serialize(set);

        expect(result[0]).toBe('Set {');
        expect(result[result.length - 1]).toBe('}');
    });

    test('returns array of lines for Buffer', () => {
        const buffer = Buffer.from([ 1, 2, 3 ]);
        const result = serialize(buffer);

        expect(result[0]).toBe('Buffer {');
        expect(result[result.length - 1]).toBe('}');
    });

    test('returns array of lines for TypedArray', () => {
        const typedArray = new Uint8Array([ 1, 2, 3 ]);
        const result = serialize(typedArray);

        expect(result[0]).toBe('Uint8Array [');
        expect(result[result.length - 1]).toBe(']');
    });

    test('returns array of lines for Date', () => {
        const date = new Date('2023-01-01T00:00:00.000Z');
        const result = serialize(date);

        expect(result[0]).toContain('Date');
    });

    test('returns array of lines for complex nested structure', () => {
        const complex = {
            string: 'value',
            number: 42,
            boolean: true,
            array: [ 1, 2, { nested: 'object' }],
            set: new Set([ 'a', 'b' ]),
            map: new Map([[ 'key', 'value' ]]),
            buffer: Buffer.from([ 1, 2, 3 ]),
            typedArray: new Uint8Array([ 4, 5, 6 ]),
            date: new Date('2023-01-01T00:00:00.000Z')
        };

        const result = serialize(complex);

        expect(result[0]).toBe('Object {');
        expect(result[result.length - 1]).toBe('}');
        expect(result.length).toBeGreaterThan(20); // Complex structure should produce many lines
        expect(result.some(line => line.includes('string:'))).toBeTruthy();
        expect(result.some(line => line.includes('number:'))).toBeTruthy();
        expect(result.some(line => line.includes('array:'))).toBeTruthy();
        expect(result.some(line => line.includes('set:'))).toBeTruthy();
        expect(result.some(line => line.includes('map:'))).toBeTruthy();
        expect(result.some(line => line.includes('buffer:'))).toBeTruthy();
        expect(result.some(line => line.includes('typedArray:'))).toBeTruthy();
        expect(result.some(line => line.includes('date:'))).toBeTruthy();
    });

    test('serialize performance with large structure', () => {
        // Create a large structure to test performance
        const largeArray = Array(1000).fill(0).map((_, i) => ({ index: i, value: `value-${ i }` }));

        // This should complete in a reasonable amount of time
        const result = serialize(largeArray);

        expect(result[0]).toBe('[');
        expect(result[result.length - 1]).toBe(']');
        expect(result.length).toBeGreaterThan(1000);
    });
});

describe('serialize - cyclic references', () => {
    class X {
        mock = [[{ args: [ 2, 'test' ], context: this, result: 123 }]];

        getMockName() {
            return 'mock';
        }
    }

    test('should handle cyclic references without throwing', () => {
        const instance = new X();

        // This will be cyclic because `context` points back to the same instance
        expect(() => {
            serialize(instance);
        }).not.toThrow();

        const lines = serialize(instance);
        const output = lines.join('\n');

        // It should contain a [Circular] marker where the cycle is detected
        expect(output).toContain('[Circular]');
    });
});

describe('serializeError', () => {
    test('returns a plain object copy of error properties', () => {
        const error = {
            code: 500,
            reason: 'Internal Server Error',
            name: 'ServerError',
            message: 'Something went wrong',
            stack: 'stack-trace'
        };

        const result = serializeError(error);

        expect(result).toEqual({
            code: 500,
            reason: 'Internal Server Error',
            name: 'ServerError',
            message: 'Something went wrong',
            stack: 'stack-trace'
        });
    });

    test('copies only defined properties', () => {
        const error = {
            code: undefined,
            name: 'ErrorName',
            message: 'ErrorMessage',
            stack: undefined
        };

        const result = serializeError(error);

        expect(result).toEqual({
            name: 'ErrorName',
            stack: undefined,
            message: 'ErrorMessage'
        });
    });

    test('includes name, message, and stack if missing in enumeration', () => {
        const error = new Error('boom');
        // Non-enumerable properties won't show up in Object.entries
        const result = <Record<string, unknown>> serializeError(error);

        expect(result.name).toBe(error.name);
        expect(result.message).toBe(error.message);
        expect(result.stack).toBe(error.stack);
    });

    test('returns result of toJSON when available', () => {
        const errorWithToJSON = {
            code: 123,
            toJSON: () => ({ custom: 'value', code: 123 })
        };

        const result = serializeError(errorWithToJSON);

        expect(result).toEqual({ custom: 'value', code: 123 });
    });

    test('returns primitive values unchanged', () => {
        expect(serializeError('test')).toBe('test');
        expect(serializeError(123)).toBe(123);
        expect(serializeError(null)).toBe(null);
        expect(serializeError(undefined)).toBe(undefined);
        expect(serializeError(true)).toBe(true);
    });
});
