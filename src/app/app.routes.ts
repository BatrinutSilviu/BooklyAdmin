import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login';
import { MainLayoutComponent } from './pages/main-layout';
import { DashboardComponent } from './pages/dashboard';
import { UserManagementComponent } from './pages/user-management';
import { BooksManagementComponent } from './pages/books-management';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

const authGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) return true;
  return router.parseUrl('/login');
};

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'users', component: UserManagementComponent },
      { path: 'books', component: BooksManagementComponent },
      { path: 'books/new', loadComponent: () => import('./pages/create-book').then(m => m.CreateBookComponent) },
      { path: 'books/edit/:id', loadComponent: () => import('./pages/create-book').then(m => m.CreateBookComponent) },
      { path: 'analytics', loadComponent: () => import('./pages/analytics').then(m => m.AnalyticsComponent) },
      { path: 'settings', loadComponent: () => import('./pages/settings').then(m => m.SettingsComponent) },
    ]
  }
];
