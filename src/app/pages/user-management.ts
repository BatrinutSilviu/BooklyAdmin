import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApiService } from '../api.service';
import { MatIconModule } from '@angular/material/icon';
import { UserWithDetails } from '../models';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="space-y-8">
      <div class="flex justify-between items-end">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">User Management</h1>
          <p class="text-slate-400 mt-1">Manage and monitor all system users.</p>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl space-y-3">
          <div class="flex justify-between items-start">
            <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Users</p>
            <mat-icon class="text-primary !text-lg">group</mat-icon>
          </div>
          <p class="text-2xl font-bold">{{ users()?.length ?? '—' }}</p>
        </div>
        <div class="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl space-y-3">
          <div class="flex justify-between items-start">
            <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Admins</p>
            <mat-icon class="text-amber-400 !text-lg">shield</mat-icon>
          </div>
          <p class="text-2xl font-bold">{{ adminCount() }}</p>
        </div>
        <div class="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl space-y-3">
          <div class="flex justify-between items-start">
            <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">With Profiles</p>
            <mat-icon class="text-emerald-400 !text-lg">person</mat-icon>
          </div>
          <p class="text-2xl font-bold">{{ usersWithProfiles() }}</p>
        </div>
      </div>

      <!-- User Directory Table -->
      <div class="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
        <div class="p-6 border-b border-slate-800">
          <h3 class="font-bold">User Directory</h3>
        </div>

        @if (!users()) {
          <div class="p-12 flex flex-col items-center gap-3 text-slate-500">
            <mat-icon class="!text-4xl animate-spin">refresh</mat-icon>
            <p class="text-sm">Loading users…</p>
          </div>
        } @else if (users()!.length === 0) {
          <div class="p-12 flex flex-col items-center gap-3 text-slate-500">
            <mat-icon class="!text-4xl">group_off</mat-icon>
            <p class="text-sm">No users found.</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead class="bg-slate-800/30 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <tr>
                  <th class="px-6 py-4">User</th>
                  <th class="px-6 py-4">Role</th>
                  <th class="px-6 py-4">Profiles</th>
                  <th class="px-6 py-4">Joined</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800">
                @for (user of users(); track user.id) {
                  <tr class="hover:bg-slate-800/20 transition-colors">
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                          {{ user.email[0].toUpperCase() }}
                        </div>
                        <span class="text-sm font-medium">{{ user.email }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <span [class]="roleBadge(user.role)">{{ user.role }}</span>
                    </td>
                    <td class="px-6 py-4">
                      @if (user.profiles?.length) {
                        <div class="flex flex-col gap-1">
                          @for (profile of user.profiles; track profile.id) {
                            <div class="flex items-center gap-2">
                              @if (profile.photo_url) {
                                <img [src]="profile.photo_url" class="w-5 h-5 rounded-full object-cover" alt="" />
                              } @else {
                                <div class="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[8px] text-slate-400">
                                  {{ profile.name?.[0]?.toUpperCase() ?? '?' }}
                                </div>
                              }
                              <span class="text-sm text-slate-300">{{ profile.name }}</span>
                              @if (profile.age) {
                                <span class="text-xs text-slate-500">· {{ profile.age }}y</span>
                              }
                            </div>
                          }
                        </div>
                      } @else {
                        <span class="text-xs text-slate-600">No profiles</span>
                      }
                    </td>
                    <td class="px-6 py-4 text-sm text-slate-500">
                      {{ user.created_at | date:'mediumDate' }}
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div class="p-4 border-t border-slate-800 bg-slate-900/20">
            <p class="text-xs text-slate-500">{{ users()!.length }} users total</p>
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserManagementComponent {
  private api = inject(ApiService);

  users = toSignal(this.api.getUsers());

  adminCount() {
    return this.users()?.filter(u => u.role === 'admin').length ?? 0;
  }

  usersWithProfiles() {
    return this.users()?.filter(u => u.profiles?.length > 0).length ?? 0;
  }

  roleBadge(role: string): string {
    const base = 'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ';
    if (role === 'admin') return base + 'bg-amber-400/10 text-amber-400';
    if (role === 'moderator') return base + 'bg-indigo-400/10 text-indigo-400';
    return base + 'bg-slate-500/10 text-slate-400';
  }
}
