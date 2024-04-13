import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { TuiAlertService } from '@taiga-ui/core';
import { TranslocoService } from '@ngneat/transloco';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const tuiAlertService = inject(TuiAlertService);
  const translocoService = inject(TranslocoService);

  const isAuthenticated = authService.isAuthenticatedNow();
    if (isAuthenticated) {
      return true;
    } else {
      router.navigate(['/sign-in']);
      translocoService.selectTranslate('auth-guard.login-required').subscribe(message => {
        translocoService.selectTranslate('auth-guard.error-title').subscribe(title => {
          tuiAlertService.open(message, { label: title, status: 'error' }).subscribe();
        });
      });
      return false;
    }
};
