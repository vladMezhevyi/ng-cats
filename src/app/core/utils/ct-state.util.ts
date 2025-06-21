import { isPlatformBrowser } from '@angular/common';
import { inject, makeStateKey, PLATFORM_ID, Signal, StateKey, TransferState } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, of, switchMap, tap } from 'rxjs';
import { createInitialState, withObservableState, WithState } from './with-observable-state.util';

/**
 * Options for configuring the `ctState` function.
 * @template Response The expected type of the response from the `request` observable.
 * @template Arguments The type of arguments that can be passed to the `request` function and `trigger` observable. Defaults to `void`.
 */
export interface CtStateOptions<Response, Arguments = void> {
  /**
   * A function that returns an Observable representing the data request.
   * It can optionally accept arguments if a `trigger` is provided.
   */
  request: (args?: Arguments) => Observable<Response>;
  /**
   * An optional Observable that, when it emits, will trigger a new request.
   * The emitted value from the trigger will be passed as arguments to the `request` function.
   */
  trigger?: Observable<Arguments>;
  /**
   * An optional initial value for the state's `data` property before the first request completes.
   */
  initialValue?: Response | null;
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
}

/**
 * Generates a unique key string for Angular's TransferState,
 * allowing for parameterized keys.
 * @param baseKey The base string for the key.
 * @param params Optional additional parameters (strings or numbers) to append to the base key,
 * separated by hyphens.
 * @returns A composite key string suitable for `TransferState`.
 *
 * @example
 * ```typescript
 * const key1 = createCtTransferStateKey('product-detail', 123); // returns 'product-detail-123'
 * const key2 = createCtTransferStateKey('user-list'); // returns 'user-list'
 * ```
 */
export const createCtTransferStateKey = (
  baseKey: string,
  ...params: (string | number)[]
): string => {
  return params.length > 0 ? `${baseKey}-${params.join('-')}` : baseKey;
};

/**
 * Prevents common issues with `CtStateOptions` configuration by throwing errors
 * for incompatible or invalid settings.
 * @template Response The type of the response.
 * @template Error The type of the error.
 * @param options The options object for `ctState`.
 * @throws {Error} If `onlyBrowser` is true and `transferStateKey` is provided.
 * @throws {Error} If `transferStateKey` is an empty string.
 * @internal
 */
const preventCtStateIssues = <Response, Error>(options: CtStateOptions<Response, Error>): void => {
  if (options.onlyBrowser && options.transferStateKey) {
    throw new Error("You can't use transfer state with onlyBrowser option");
  }

  if (typeof options.transferStateKey === 'string' && options.transferStateKey === '') {
    throw new Error('You provided wrong transfer state key');
  }
};

/**
 * Creates an Angular Signal that manages asynchronous state, supporting
 * server-side rendering (SSR) with TransferState, client-side only requests,
 * and request triggering.
 *
 * This function injects `PLATFORM_ID` and `TransferState` internally.
 *
 * @template Response The type of the data returned by the request.
 * @template Arguments The type of arguments that can be passed to the request function,
 * relevant when a `trigger` is used. Defaults to `void`.
 * @template Error The type of the error that can occur during the request. Defaults to `unknown`.
 *
 * @param options Configuration options for the state management.
 *
 * @returns An Angular `Signal` containing `WithState<Response, Error>`, which updates
 * with `data`, `loading`, and `error` as the request progresses.
 *
 * @example
 * // Basic usage for fetching data once on component initialization
 * const productState = ctState<{ id: number; name: string }>({
 *   request: () => this.productService.getProduct(123),
 *   transferStateKey: 'product-detail-123'
 * });
 *
 * @example
 * // Usage with a trigger (e.g., from a button click or route parameter change)
 * const userId$ = new Subject<number>();
 * const userState = ctState<{ id: number; name: string }, number>({
 *   request: (id) => this.userService.getUser(id),
 *   trigger: userId$.asObservable(),
 *   initialValue: { id: 0, name: 'Bob' },
 *   transferStateKey: 'user-detail'
 * });
 * // Later: userId$.next(456); to trigger a new request
 *
 * @example
 * // Browser-only request (e.g., for browser-specific APIs)
 * const geolocationState = ctState<{ lat: number; lng: number }>({
 *   request: () => from(navigator.geolocation.getCurrentPosition()),
 *   onlyBrowser: true
 * });
 */
export const ctState = <Response, Arguments = void, Error = unknown>(
  options: CtStateOptions<Response, Arguments>
): Signal<WithState<Response, Error>> => {
  preventCtStateIssues(options);

  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);
  const transferState = inject(TransferState);

  const stateKey: StateKey<Response> | null = options.transferStateKey
    ? makeStateKey(`ct-state-${options.transferStateKey}`)
    : null;

  // Handle onlyBrowser case immediately if not in browser
  if (options.onlyBrowser && !isBrowser) {
    const serverState: WithState<Response, Error> = createInitialState<Response, Error>(
      false,
      null,
      null
    );
    return toSignal(of(serverState), { initialValue: serverState });
  }

  const initialValue: Response | null = options.initialValue ?? null;
  let stream$: Observable<WithState<Response, Error>>;

  /**
   * Internal helper function to manage the application of TransferState logic
   * based on the environment and presence of a `stateKey`.
   * @param sourceObservable The original Observable representing the data request.
   * @returns An Observable wrapped with `WithState` that incorporates TransferState optimizations.
   * @internal
   */
  const handleTransferState = (
    source: Observable<Response>
  ): Observable<WithState<Response, Error>> => {
    // If no stateKey, bypass transfer state logic
    if (!stateKey) {
      return withObservableState<Response, Error>(source, initialValue, true);
    }

    if (isBrowser) {
      let savedResponse: Response | null = transferState.get(stateKey, null);

      if (savedResponse !== null) {
        // Use saved response from TransferState. No initial loading needed.
        return withObservableState<Response, Error>(of(savedResponse), initialValue, false).pipe(
          tap(() => {
            // Clean up after use to prevent stale data
            transferState.remove(stateKey);
            savedResponse = null;
          })
        );
      } else {
        // No saved data, execute the actual request. Show initial loading.
        return withObservableState<Response, Error>(source, initialValue, true);
      }
    } else {
      // On server, execute request and save the response to TransferState.
      // No initial loading on server as it will be resolved before rendering.
      return withObservableState<Response, Error>(
        source.pipe(tap((response) => transferState.set(stateKey, response))),
        initialValue,
        false
      );
    }
  };

  if (options.trigger) {
    stream$ = options.trigger.pipe(switchMap((args) => handleTransferState(options.request(args))));
  } else {
    stream$ = handleTransferState(options.request());
  }

  // Determine the initial state for the signal.
  // Loading is true in browser if there's no trigger and no transfer state key,
  // because a request will immediately start in the browser without server pre-rendering.
  const initialSignalState: WithState<Response, Error> = createInitialState<Response, Error>(
    isBrowser && !options.trigger && !stateKey,
    initialValue
  );
  return toSignal(stream$, { initialValue: initialSignalState });
};
