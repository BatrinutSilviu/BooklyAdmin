import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const storage = typeof window !== 'undefined' ? window.localStorage : null;
  const saved = storage?.getItem('bookly_admin_auth');
  
  if (saved) {
    try {
      const user = JSON.parse(saved);
      if (user.token) {
        const authReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${user.token}`
          }
        });
        return next(authReq);
      }
    } catch {
      // Ignore parse errors
    }
  }
  
  return next(req);
};
