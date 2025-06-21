import { isPlatformBrowser } from '@angular/common';
import { inject, makeStateKey, PLATFORM_ID, Signal, StateKey, TransferState } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, of, switchMap, tap } from 'rxjs';
import { createInitialState, withObservableState, WithState } from './with-observable-state.util';

export interface CtStateOptions<Response, Arguments = void> {
  request: (args?: Arguments) => Observable<Response>;
  trigger?: Observable<Arguments>;
  initialValue?: Response | null;
  onlyBrowser?: boolean;
  transferStateKey?: string;
}

export const createCtTransferStateKey = (
  baseKey: string,
  ...params: (string | number)[]
): string => {
  return params.length > 0 ? `${baseKey}-${params.join('-')}` : baseKey;
};

export const ctState = <Response, Arguments = void, Error = unknown>(
  options: CtStateOptions<Response, Arguments>
): Signal<WithState<Response, Error>> => {
  preventIssues(options);

  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);
  const transferState = inject(TransferState);
  const stateKey: StateKey<Response> | null = options.transferStateKey
    ? makeStateKey(`ct-state-${options.transferStateKey}`)
    : null;

  if (options.onlyBrowser && !isBrowser) {
    const serverState: WithState<Response, Error> = createInitialState<Response, Error>(
      false,
      null,
      null
    );
    return toSignal(of(serverState), { initialValue: serverState });
  }

  const initialValue: Response | null = options.initialValue ?? null;
  let stream$: Observable<WithState<Response, Error>> | null;

  const handleTransferState = (
    source: Observable<Response>
  ): Observable<WithState<Response, Error>> => {
    if (!stateKey) {
      return withObservableState<Response, Error>(source, initialValue, true);
    }

    if (isBrowser) {
      let savedResponse: Response | null = transferState.get(stateKey, null);

      if (savedResponse !== null) {
        return withObservableState<Response, Error>(of(savedResponse), initialValue, true).pipe(
          tap(() => {
            transferState.remove(stateKey);
            savedResponse = null;
          })
        );
      } else {
        return withObservableState<Response, Error>(source, initialValue, true);
      }
    } else {
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

  const initialSignalState: WithState<Response, Error> = createInitialState<Response, Error>(
    isBrowser && !options.trigger && !stateKey,
    initialValue
  );
  return toSignal(stream$, { initialValue: initialSignalState });
};

const preventIssues = <Response, Error>(options: CtStateOptions<Response, Error>): void => {
  if (options.onlyBrowser && options.transferStateKey) {
    throw new Error("You can't use transfer state with onlyBrowser option");
  }

  if (typeof options.transferStateKey === 'string' && options.transferStateKey === '') {
    throw new Error('You provided wrong transfer state key');
  }
};
