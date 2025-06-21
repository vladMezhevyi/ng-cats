import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, of, switchMap } from 'rxjs';
import { createInitialState, withObservableState, WithState } from './with-observable-state.util';

export interface CtStateOptions<Response, Arguments = void> {
  request: (args?: Arguments) => Observable<Response>;
  trigger?: Observable<Arguments>;
  initialValue?: Response | null;
  onlyBrowser?: boolean;
}

export const ctState = <Response, Arguments = void, Error = unknown>(
  options: CtStateOptions<Response, Arguments>
): Signal<WithState<Response, Error>> => {
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);

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

  if (options.trigger) {
    stream$ = options.trigger.pipe(
      switchMap((args) =>
        withObservableState<Response, Error>(options.request(args), initialValue, true)
      )
    );
  } else {
    stream$ = withObservableState<Response, Error>(options.request(), initialValue, isBrowser);
  }

  const initialSignalState: WithState<Response, Error> = createInitialState<Response, Error>(
    isBrowser && !options.trigger,
    initialValue
  );
  return toSignal(stream$, { initialValue: initialSignalState });
};
