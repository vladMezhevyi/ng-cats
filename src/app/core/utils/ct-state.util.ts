import { isPlatformBrowser } from '@angular/common';
import {
  inject,
  makeStateKey,
  PLATFORM_ID,
  signal,
  Signal,
  StateKey,
  TransferState
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, Observable, of, shareReplay, startWith, switchMap, tap } from 'rxjs';

/**
 * Options for configuring the `ctState` function.
 * @template Res The expected type of the response from the `request` observable.
 * @template Arguments The type of arguments that can be passed to the `request` function and `trigger` observable. Defaults to `void`.
 * @template Err The type of error that can be caught during the request. Defaults to `unknown`.
 */
export interface CtStateConfig<Res, Args = void, Err = unknown> {
  /**
   * A function that returns an Observable representing the data request.
   * It can optionally accept arguments if a `trigger` is provided.
   */
  request: (args?: Args) => Observable<Res>;

  /**
   * An Observable that, when it emits, will trigger a new request.
   * The emitted value from the trigger will be passed as arguments to the `request` function.
   */
  trigger: Observable<Args>;

  /**
   * An optional initial value for the state's `data` property before the first request completes.
   */
  initialState?: CtState<Res, Err> | null;

  /**
   * If `true`, the request will only be made in the browser environment.
   * This option cannot be used with `transferStateKey`.
   */
  onlyBrowser?: boolean;

  /**
   * An optional key used for Angular's TransferState mechanism.
   * If provided, data fetched on the server will be transferred to the browser to prevent re-fetching.
   * Cannot be an empty string if provided.
   */
  transferStateKey?: string;

  /**
   * An optional callback function that is executed when the data request successfully completes.
   * @param response The data returned from the successful request.
   */
  onSuccess?: (response: Res) => void;

  /**
   * An optional callback function that is executed when the data request fails.
   * @param error The error object from the failed request.
   */
  onError?: (error: Err) => void;
}

/**
 * Represents the state structure managed by `ctActionState`.
 * @template Res The type of the data held in the state.
 * @template Err The type of the error held in the state. Defaults to `unknown`.
 */
export interface CtState<Res, Err = unknown> {
  /**
   * The actual data fetched by the request, or `null` if not yet loaded or an error occurred.
   */
  data: Res | null;

  /**
   * A boolean indicating if a data request is currently in progress.
   */
  loading: boolean;

  /**
   * The error object if the data request failed, or `null` if successful.
   */
  error: Err | null;
}

/**
 * Returns a default initial state object for `CtState`.
 * @template Res The type of the data for the state.
 * @template Err The type of the error for the state. Defaults to `unknown`.
 * @returns A new `CtState` object with `data`, `loading`, and `error` initialized to `null`, `false`, and `null` respectively.
 */
export const getInitialState = <Res, Err = unknown>(): CtState<Res, Err> => ({
  data: null,
  loading: false,
  error: null
});

/**
 * Creates an Angular Signal that manages asynchronous state, including loading, data, and error states,
 * with optional Server-Side Rendering (SSR) support via Angular's TransferState.
 *
 * @template Res The expected type of the response from the `request` observable.
 * @template Args The type of arguments that can be passed to the `request` function and `trigger` observable. Defaults to `void`.
 * @template Err The type of error that can be caught during the request. Defaults to `unknown`.
 *
 * @param config Configuration object for the state management, including `request`, `trigger`, and SSR options.
 * @returns A readonly Angular Signal containing the current state (`CtState<Res, Err>`).
 * @throws {Error} If `onlyBrowser` is `true` and `transferStateKey` is provided, as these options are mutually exclusive.
 * @throws {Error} If `transferStateKey` is provided but is an empty string.
 */
export const ctActionState = <Res, Args = void, Err = unknown>(
  config: CtStateConfig<Res, Args, Err>
): Signal<CtState<Res, Err>> => {
  // Validate configuration to prevent logical conflicts.
  if (config.onlyBrowser && config.transferStateKey) {
    throw new Error("You can't use transfer state with onlyBrowser option");
  }

  // Validate that if transferStateKey is provided, it's not an empty string.
  if (typeof config.transferStateKey === 'string' && config.transferStateKey === '') {
    throw new Error('You provided wrong transfer state key');
  }

  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);
  const transferState = inject(TransferState);

  /**
   * Creates a unique `StateKey` for TransferState, if `transferStateKey` is provided in the config.
   * This key is used to save data on the server and retrieve it on the browser.
   */
  const stateKey: StateKey<Res> | null = config.transferStateKey
    ? makeStateKey(`ct-state-${config.transferStateKey}`)
    : null;

  const initialState: CtState<Res, Err> = config.initialState ?? getInitialState<Res, Err>();

  // If `onlyBrowser` is true and running on the server, return a static initial state
  // to prevent requests from being made on the server.
  if (config.onlyBrowser && !isBrowser) {
    return signal(initialState).asReadonly();
  }

  const stream$: Observable<CtState<Res, Err>> = config.trigger.pipe(
    switchMap((args) => {
      let request$: Observable<Res>;

      // Determine whether to fetch data or attempt to retrieve from TransferState.
      if (!stateKey || !isBrowser) {
        request$ = config.request(args);
      } else {
        const savedResponse: Res | null = transferState.get(stateKey, null);
        request$ = savedResponse === null ? config.request(args) : of(savedResponse);
      }

      return request$.pipe(
        tap((response) => {
          if (!stateKey) return;

          // In the browser, remove the key after hydration; on the server, set the key.
          if (isBrowser) {
            transferState.remove(stateKey);
          } else {
            transferState.set(stateKey, response);
          }
        }),
        map((response) => {
          config.onSuccess?.(response);
          return { ...initialState, data: response };
        }),
        catchError((error) => {
          config.onError?.(error);
          return of({ ...initialState, error });
        }),
        startWith({ ...initialState, loading: true })
      );
    }),
    startWith({ ...initialState, loading: true }),
    shareReplay(1)
  );

  return toSignal(stream$, { initialValue: initialState });
};
