import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('http://') && !req.url.startsWith('https://')) {
    const apiReq: HttpRequest<unknown> = req.clone({
      url: environment.apiUrl + req.url,
    });

    return next(apiReq);
  }

  return next(req);
};
