import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth-service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService);
  const token = authService.getToken();

  const isApiRequest = req.url.startsWith(`${environment.apiURL}/`);
  const isAuthRequest = req.url.startsWith(`${environment.apiURL}/auth/`);

  if (token && isApiRequest && !isAuthRequest) {
    const authRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(authRequest);
  }
  return next(req);
};
