import { catchError, map, Observable, of, startWith } from 'rxjs';

/**
 * Represents the state structure that provides data, loading and error information.
 * @template Response The type of the data held in the state.
 * @template Error The type of the error, if any, held in the state. Defaults to `unknown`.
 */
export interface WithState<Response, Error = unknown> {
  data: Response | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Creates an initial state object with default values for `data`, `loading`, and `error`.
 * @template Response The type of the data.
 * @template Error The type of the error. Defaults to `unknown`.
 * @param loading Whether the initial state should indicate loading. Defaults to `false`.
 * @param data The initial data value. Defaults to `null`.
 * @param error The initial error value. Defaults to `null`.
 * @returns An object conforming to the `WithState` interface.
 */
export const createInitialState = <Response, Error = unknown>(
  loading: boolean = false,
  data: Response | null = null,
  error: Error | null = null
): WithState<Response, Error> => ({
  data,
  loading,
  error
});

/**
 * Transforms a given Observable into an Observable that emits `WithState` objects,
 * providing loading, data, and error states.
 * @template Response The type of the data emitted by the source observable.
 * @template Error The type of the error. Defaults to `unknown`.
 * @param observable The source Observable emitting the raw response data.
 * @param initialValue An optional initial value to include in the state before the observable emits.
 * @param showInitialLoading If `true`, the first state emitted will have `loading: true`. Defaults to `true`.
 * @returns An Observable that emits `WithState<Response, Error>` objects.
 */
export const withObservableState = <Response, Error = unknown>(
  source: Observable<Response>,
  initialValue: Response | null = null,
  showInitialLoading: boolean = true
): Observable<WithState<Response, Error>> =>
  source.pipe(
    map((data) => createInitialState<Response, Error>(false, data)),
    catchError((error: Error) =>
      of<WithState<Response, Error>>(createInitialState<Response, Error>(false, null, error))
    ),
    startWith<WithState<Response, Error>>(
      createInitialState<Response, Error>(showInitialLoading, initialValue)
    )
  );
