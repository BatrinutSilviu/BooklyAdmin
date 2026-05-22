import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../auth.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, MatIconModule],
  template: `
    <div class="flex h-screen bg-bg-dark text-slate-100 overflow-hidden">
      <!-- Sidebar -->
      <aside class="w-64 border-r border-slate-800 flex flex-col bg-bg-dark/50 backdrop-blur-xl">
        <div class="p-6 flex items-center gap-3">
          <div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <mat-icon class="text-white">menu_book</mat-icon>
          </div>
          <span class="text-xl font-bold tracking-tight">BooklyAdmin</span>
        </div>

        <nav class="flex-1 px-4 py-4 space-y-1">
          <a routerLink="/dashboard" routerLinkActive="bg-primary text-white" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all group">
            <mat-icon class="group-hover:scale-110 transition-transform">dashboard</mat-icon>
            <span class="font-medium">Dashboard</span>
          </a>
          <a routerLink="/books" routerLinkActive="bg-primary text-white" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all group">
            <mat-icon class="group-hover:scale-110 transition-transform">menu_book</mat-icon>
            <span class="font-medium">Books</span>
          </a>
          <a routerLink="/users" routerLinkActive="bg-primary text-white" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all group">
            <mat-icon class="group-hover:scale-110 transition-transform">group</mat-icon>
            <span class="font-medium">Users</span>
          </a>
          <a routerLink="/analytics" routerLinkActive="bg-primary text-white" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all group">
            <mat-icon class="group-hover:scale-110 transition-transform">bar_chart</mat-icon>
            <span class="font-medium">Analytics</span>
          </a>
          <a routerLink="/settings" routerLinkActive="bg-primary text-white" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all group">
            <mat-icon class="group-hover:scale-110 transition-transform">settings</mat-icon>
            <span class="font-medium">Settings</span>
          </a>
        </nav>

        <div class="p-4 border-t border-slate-800">
          <div class="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800">
            <img [src]="auth.currentUser()?.avatar" class="w-10 h-10 rounded-lg object-cover" referrerpolicy="no-referrer" alt="User Avatar" />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold truncate">{{ auth.currentUser()?.name }}</p>
              <p class="text-xs text-slate-500 truncate">{{ auth.currentUser()?.role }}</p>
            </div>
            <button (click)="auth.logout()" class="text-slate-500 hover:text-red-400 transition-colors">
              <mat-icon class="!text-xl">logout</mat-icon>
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col overflow-hidden">
        <!-- Header -->
        <header class="h-20 border-b border-slate-800 flex items-center justify-between px-8 bg-bg-dark/30 backdrop-blur-md z-10">
          <div class="flex-1 max-w-xl">
            <div class="relative group">
              <mat-icon class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">search</mat-icon>
              <input 
                type="text" 
                placeholder="Search books, users, or reports..."
                class="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-2.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
            </div>
          </div>

          <div class="flex items-center gap-4">
            <button class="w-10 h-10 rounded-xl border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all relative">
              <mat-icon>notifications</mat-icon>
              <span class="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-bg-dark"></span>
            </button>
            <button class="w-10 h-10 rounded-xl border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
              <mat-icon>help_outline</mat-icon>
            </button>
          </div>
        </header>

        <!-- Page Content -->
        <div class="flex-1 overflow-y-auto p-8">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainLayoutComponent {
  auth = inject(AuthService);
}
