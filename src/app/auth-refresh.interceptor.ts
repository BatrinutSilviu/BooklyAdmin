import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError, switchMap, catchError } from 'rxjs';
import { AuthService } from './auth.service';

export const authRefreshInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && auth.currentUser()?.refreshToken) {
        return auth.refreshAccessToken()!.pipe(
          switchMap(result => {
            if (!result) return throwError(() => error);
            const user = auth.currentUser();
            if (!user?.token) return throwError(() => error);
            const retried = req.clone({ setHeaders: { Authorization: `Bearer ${user.token}` } });
            return next(retried);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
