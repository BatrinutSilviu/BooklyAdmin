import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login';
import { MainLayoutComponent } from './pages/main-layout';
import { DashboardComponent } from './pages/dashboard';
import { UserManagementComponent } from './pages/user-management';
import { StoriesManagementComponent } from './pages/stories-management';
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
      { path: 'stories', component: StoriesManagementComponent },
      { path: 'stories/new', loadComponent: () => import('./pages/create-story').then(m => m.CreateStoryComponent) },
      { path: 'stories/edit/:id', loadComponent: () => import('./pages/create-story').then(m => m.CreateStoryComponent) },
      { path: 'series/new', loadComponent: () => import('./pages/create-series').then(m => m.CreateSeriesComponent) },
      { path: 'series/edit/:id', loadComponent: () => import('./pages/create-series').then(m => m.CreateSeriesComponent) },
      { path: 'analytics', loadComponent: () => import('./pages/analytics').then(m => m.AnalyticsComponent) },
      { path: 'settings', loadComponent: () => import('./pages/settings').then(m => m.SettingsComponent) },
    ]
  }
];
