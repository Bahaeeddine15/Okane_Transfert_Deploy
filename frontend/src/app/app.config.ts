import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection  } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt-interceptor';
import { errorInterceptor } from './core/interceptors/error-interceptor';


import { provideClientHydration, withEventReplay, withNoHttpTransferCache } from '@angular/platform-browser';



export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideClientHydration(withEventReplay(), withNoHttpTransferCache()),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        jwtInterceptor,
        errorInterceptor,
      ])
    ),
  ],
};