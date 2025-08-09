/**
 * Base abstract error class for all xJet-specific errors
 *
 * Extends the native Error class with improved stack trace handling
 * and serialization capabilities for better error reporting.
 *
 * @remarks
 * This class serves as the foundation for all custom error types in the xJet framework.
 * It provides consistent error behavior, proper prototype chain setup, and serialization
 * to support error logging and transmission across boundaries.
 *
 * @example
 * ```ts
 * // Extending the base error class
 * export class ValidationError extends xJetBaseError {
 *   constructor(message: string) {
 *     super(message);
 *     this.name = 'ValidationError';
 *   }
 * }
 * ```
 *
 * @since 1.0.0
 */

export abstract class xJetBaseError extends Error {
    /**
     * Creates a new instance of the base error class
     *
     * @param message - The error message to display
     *
     * @remarks
     * This constructor properly sets up the prototype chain for derived error classes
     * and captures the stack trace if the runtime environment supports it. This ensures
     * that stack traces will show the correct error source and inheritance.
     *
     * @since 1.0.0
     */

    protected constructor(message: string) {
        super(message);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    /**
     * Serializes the xJetError instance to a plain object suitable for JSON conversion.
     *
     * @returns A plain object containing all properties of the error instance
     *
     * @remarks
     * This method creates a serializable representation of the error by copying all own
     * enumerable properties to a new object. It also explicitly ensures that critical properties
     * like name, message, and stack are included in the result, even if they are non-enumerable
     * in the original error object.
     *
     * The resulting object can be used with JSON.stringify() to create a complete JSON
     * representation of the error, which is useful for logging, error reporting, and
     * transmitting error details across process boundaries.
     *
     * @example
     * ```ts
     * const error = new xJetError('Expected value to be truthy');
     * const serialized = error.toJSON();
     * const json = JSON.stringify(serialized);
     *
     * // Later, this can be used for error reporting
     * console.error(json);
     * ```
     *
     * @since 1.0.0
     */

    toJSON(): Record<string, unknown> {
        const json: Record<string, unknown> = {};

        // Copy all own (non-inherited) enumerable properties
        for (const key of Object.keys(this)) {
            const value = this[key as keyof this];
            if(value) json[key] = value;
        }

        // Ensure `name`, `message`, and `stack` are included
        json.name = this.name;
        json.stack = this.stack;
        json.message = this.message;

        return json;
    }
}
