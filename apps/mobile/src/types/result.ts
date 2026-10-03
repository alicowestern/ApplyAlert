/**
 * Result type for consistent error handling across services.
 *
 * All service methods that can fail should return Result<T, E>
 * instead of throwing exceptions. This makes error handling
 * explicit and type-safe.
 */

export type Result<T, E = Error> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

/** Create a success result. */
export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

/** Create a failure result. */
export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

/**
 * Unwrap a result, throwing the error if it's a failure.
 * Use sparingly — prefer pattern matching with if/else.
 */
export function unwrap<T, E>(result: Result<T, E>): T {
  if (result.ok) {
    return result.value;
  }
  throw result.error;
}
