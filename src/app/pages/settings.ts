import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, MatIconModule, ReactiveFormsModule],
  template: `
    <div class="space-y-8">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Settings</h1>
        <p class="text-slate-400 mt-1">Manage your account preferences and application configuration.</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
            <div class="p-6 border-b border-slate-800">
              <h3 class="font-bold">General Settings</h3>
            </div>
            <div class="p-6 space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label for="app-name" class="text-sm font-semibold text-slate-400">Application Name</label>
                  <input id="app-name" type="text" value="BooklyAdmin" class="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2.5 px-4 text-white outline-none focus:border-primary transition-all">
                </div>
                <div class="space-y-2">
                  <label for="support-email" class="text-sm font-semibold text-slate-400">Support Email</label>
                  <input id="support-email" type="email" value="support@bookly.com" class="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2.5 px-4 text-white outline-none focus:border-primary transition-all">
                </div>
              </div>
              <div class="space-y-2">
                <label for="default-lang" class="text-sm font-semibold text-slate-400">Default Language</label>
                <select id="default-lang" class="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2.5 px-4 text-white outline-none focus:border-primary transition-all">
                  <option>English (US)</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
              </div>
            </div>
          </div>

          <div class="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
            <div class="p-6 border-b border-slate-800">
              <h3 class="font-bold">Notifications</h3>
            </div>
            <div class="p-6 space-y-4">
              @for (pref of notificationPrefs; track pref.id) {
                <div class="flex items-center justify-between py-2">
                  <div>
                    <p class="font-medium">{{pref.label}}</p>
                    <p class="text-xs text-slate-500">{{pref.description}}</p>
                  </div>
                  <div class="w-12 h-6 bg-slate-800 rounded-full relative cursor-pointer">
                    <div class="absolute left-1 top-1 w-4 h-4 bg-slate-400 rounded-full transition-all" [class.translate-x-6]="pref.enabled" [class.bg-primary]="pref.enabled"></div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <div class="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl">
            <h3 class="font-bold mb-4">Quick Actions</h3>
            <div class="space-y-3">
              <button class="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-bold transition-all flex items-center gap-3">
                <mat-icon class="!text-lg">backup</mat-icon>
                Backup Database
              </button>
              <button class="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-bold transition-all flex items-center gap-3 text-rose-400">
                <mat-icon class="!text-lg">delete_sweep</mat-icon>
                Clear Cache
              </button>
            </div>
          </div>

          <div class="bg-primary/10 border border-primary/20 p-6 rounded-2xl">
            <div class="flex items-center gap-3 text-primary mb-3">
              <mat-icon>info</mat-icon>
              <h3 class="font-bold">System Info</h3>
            </div>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-slate-400">Version</span>
                <span class="font-mono">2.4.0-stable</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Environment</span>
                <span class="font-mono">Production</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">Uptime</span>
                <span class="font-mono">14d 6h 22m</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class SettingsComponent {
  notificationPrefs = [
    { id: 'email_new_book', label: 'Email on New Book', description: 'Get notified when a new book is submitted for review.', enabled: true },
    { id: 'email_user_signup', label: 'User Signups', description: 'Weekly summary of new user registrations.', enabled: false },
    { id: 'push_alerts', label: 'Critical System Alerts', description: 'Real-time push notifications for server issues.', enabled: true }
  ];
}
