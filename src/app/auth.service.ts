import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { catchError, of, tap, switchMap } from 'rxjs';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  token?: string;
  refreshToken?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private api = inject(ApiService);
  
  isAuthenticated = signal<boolean>(false);
  currentUser = signal<AuthUser | null>(null);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const storage = typeof window !== 'undefined' ? window.localStorage : null;
        if (storage) {
          const saved = storage.getItem('story_admin_auth');
          if (saved) {
            const user = JSON.parse(saved);
            if (user.id) {
              this.isAuthenticated.set(true);
              this.currentUser.set(user);
            } else {
              storage.removeItem('story_admin_auth');
            }
          }
        }
      } catch {
        // Silently fail on storage access errors
      }
    }
  }

  refreshAccessToken() {
    const user = this.currentUser();
    if (!user?.refreshToken) return of(null);

    return this.api.refreshToken(user.refreshToken).pipe(
      tap(session => {
        const updated: AuthUser = { ...user, token: session.access_token, refreshToken: session.refresh_token };
        this.currentUser.set(updated);
        this.saveToStorage(updated);
      }),
      catchError(() => {
        this.logout();
        return of(null);
      })
    );
  }

  login(credentials: unknown) {
    return this.api.login(credentials).pipe(
      switchMap(response => {
        const user = response.user;
        const token = response.session.access_token;
        
        const refreshToken = response.session.refresh_token;

        // After login, try to fetch profiles for this user
        return this.api.getUserProfiles(user.id).pipe(
          tap(profiles => {
            const profile = profiles[0];
            const authUser: AuthUser = {
              id: user.id,
              name: profile?.name || user.email.split('@')[0],
              email: user.email,
              role: 'Super Admin', // Default role for admin panel
              avatar: profile?.photo_url || `https://i.pravatar.cc/150?u=${user.id}`,
              token: token,
              refreshToken: refreshToken
            };

            this.isAuthenticated.set(true);
            this.currentUser.set(authUser);
            this.saveToStorage(authUser);
            this.router.navigate(['/dashboard']);
          }),
          catchError(() => {
            // If profile fetch fails, still log in with basic info
            const authUser: AuthUser = {
              id: user.id,
              name: user.email.split('@')[0],
              email: user.email,
              role: 'Super Admin',
              avatar: `https://i.pravatar.cc/150?u=${user.id}`,
              token: token,
              refreshToken: refreshToken
            };
            this.isAuthenticated.set(true);
            this.currentUser.set(authUser);
            this.saveToStorage(authUser);
            this.router.navigate(['/dashboard']);
            return of(null);
          })
        );
      })
    );
  }

  private saveToStorage(user: AuthUser) {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const storage = typeof window !== 'undefined' ? window.localStorage : null;
        if (storage) {
          storage.setItem('story_admin_auth', JSON.stringify(user));
        }
      } catch {
        // Silently fail
      }
    }
  }

  logout() {
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    
    if (isPlatformBrowser(this.platformId)) {
      try {
        const storage = typeof window !== 'undefined' ? window.localStorage : null;
        if (storage) {
          storage.removeItem('story_admin_auth');
        }
      } catch {
        // Silently fail
      }
    }
    
    this.router.navigate(['/login']);
  }
}
