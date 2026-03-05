import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../data.service';
import { MatIconModule } from '@angular/material/icon';

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
        <button class="bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 transition-all">
          <mat-icon>person_add</mat-icon>
          Add User
        </button>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl space-y-3">
          <div class="flex justify-between items-start">
            <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Users</p>
            <mat-icon class="text-primary !text-lg">group</mat-icon>
          </div>
          <p class="text-2xl font-bold">1,240</p>
          <div class="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
            <mat-icon class="!text-xs">trending_up</mat-icon> +12% from last month
          </div>
        </div>
        <div class="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl space-y-3">
          <div class="flex justify-between items-start">
            <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Default Tier</p>
            <mat-icon class="text-slate-400 !text-lg">person</mat-icon>
          </div>
          <p class="text-2xl font-bold">850</p>
          <div class="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
            <mat-icon class="!text-xs">trending_up</mat-icon> +5% growth
          </div>
        </div>
        <div class="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl space-y-3">
          <div class="flex justify-between items-start">
            <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Premium Tier</p>
            <mat-icon class="text-amber-400 !text-lg">star</mat-icon>
          </div>
          <p class="text-2xl font-bold">310</p>
          <div class="text-[10px] text-rose-400 font-bold flex items-center gap-1">
            <mat-icon class="!text-xs">trending_down</mat-icon> -2% churn
          </div>
        </div>
        <div class="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl space-y-3">
          <div class="flex justify-between items-start">
            <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Free Trials</p>
            <mat-icon class="text-indigo-400 !text-lg">timer</mat-icon>
          </div>
          <p class="text-2xl font-bold">80</p>
          <div class="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
            <mat-icon class="!text-xs">trending_up</mat-icon> +15% conversion
          </div>
        </div>
      </div>

      <!-- User Directory Table -->
      <div class="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
        <div class="p-6 border-b border-slate-800 flex justify-between items-center">
          <h3 class="font-bold">User Directory</h3>
          <div class="flex gap-2">
            <button class="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
              <mat-icon>filter_list</mat-icon>
            </button>
            <button class="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
              <mat-icon>download</mat-icon>
            </button>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-slate-800/30 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th class="px-6 py-4">Name</th>
                <th class="px-6 py-4">Email</th>
                <th class="px-6 py-4">Type</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800">
              @for (user of data.users(); track user.id) {
                <tr class="hover:bg-slate-800/20 transition-colors group">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                        {{ getInitials(user.email) }}
                      </div>
                      <span class="text-sm font-bold">{{ user.email.split('@')[0] }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-sm text-slate-400">{{ user.email }}</td>
                  <td class="px-6 py-4">
                    <span 
                      class="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-500/10 text-slate-400"
                    >
                      Default
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                      <span 
                        class="w-1.5 h-1.5 rounded-full bg-emerald-400"
                      ></span>
                      <span class="text-sm text-slate-300">Active</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button class="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
                        <mat-icon class="!text-lg">edit</mat-icon>
                      </button>
                      <button class="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                        <mat-icon class="!text-lg">delete</mat-icon>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <div class="p-4 border-t border-slate-800 flex justify-between items-center bg-slate-900/20">
          <p class="text-xs text-slate-500">Showing 5 of 1,240 users</p>
          <div class="flex gap-2">
            <button class="px-4 py-1.5 text-xs font-bold text-slate-400 hover:text-white disabled:opacity-30 transition-all" disabled>Previous</button>
            <button class="px-6 py-1.5 text-xs font-bold bg-primary text-white rounded-lg hover:bg-primary/90 transition-all">Next</button>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserManagementComponent {
  data = inject(DataService);

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('');
  }
}
