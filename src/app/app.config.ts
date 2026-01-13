import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { errorLogInterceptor } from './shared/interceptors/error-log.interceptor';
import { userIdInterceptor } from './shared/interceptors/user-id.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([userIdInterceptor, errorLogInterceptor])),
    provideAnimations(),
    importProvidersFrom(MatSnackBarModule),
    provideRouter(routes)
  ]
};
