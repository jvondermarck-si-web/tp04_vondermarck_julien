import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../../shared/models/user.interface';
import { catchError, tap } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { TranslocoService } from '@ngneat/transloco';
import { TuiAlertService } from '@taiga-ui/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _user: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  private _isAuthenticated = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient, private translocoService: TranslocoService, private readonly alerts: TuiAlertService, private router: Router) { }

  public get user() {
    return this._user.asObservable();
  }

  public get isAuthenticated() {
    return this._isAuthenticated.asObservable();
  }

  public isAuthenticatedNow(): boolean {
    return this._isAuthenticated.getValue();
  }

  login(email: string, password: string) {
    return this.http.post<User>('/api/auth/login', { email, password }).pipe(
      tap(user => {
        this._user.next(user);
        this._isAuthenticated.next(!!user);
        const message = this.translocoService.translate('sign-in.success-login', { user: user.firstName });
          this.alerts.open('', { label: message, status: 'success' }).subscribe();
      }),
      catchError(error => {
        this.alerts.open('',{ label: this.translocoService.translate('sign-in.error-login'), status: 'error' }).subscribe();
        return error;
      })
    );
  }

  register(user: User) {
    return this.http.post<User>('/api/auth/register', user).pipe(
      tap(user => {
        this._user.next(user);
        this._isAuthenticated.next(!!user);
      })
    );
  }

  logout() {
    this._user.next(null);
    this._isAuthenticated.next(false);
    this.router.navigate(['/sign-in']);

    this.translocoService.selectTranslate('sign-in.success-logout').subscribe(message => {
      this.alerts.open('', { label: message, status: 'info' }).subscribe();
    });
  }
}

