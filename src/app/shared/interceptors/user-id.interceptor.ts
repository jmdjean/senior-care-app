import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const userIdInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const userId = authService.getUserId();

  if (!userId) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        'x-user-id': userId
      }
    })
  );
};
