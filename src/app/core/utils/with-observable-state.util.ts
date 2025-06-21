import { catchError, map, Observable, of, startWith } from 'rxjs';

export interface WithState<Response, Error = unknown> {
  data: Response | null;
  loading: boolean;
  error: Error | null;
}

export const createInitialState = <Response, Error = unknown>(
  loading: boolean = false,
  data: Response | null = null,
  error: Error | null = null
): WithState<Response, Error> => ({
  data,
  loading,
  error
});

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
