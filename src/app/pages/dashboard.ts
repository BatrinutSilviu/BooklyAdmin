import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../data.service';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  template: `
    <div class="space-y-8">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p class="text-slate-400 mt-1">Welcome back, Alex. Here's what's happening with your stories today.</p>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div class="flex justify-between items-start">
            <div class="space-y-1">
              <p class="text-sm font-medium text-slate-400">Total Stories</p>
              <p class="text-3xl font-bold">1,284</p>
            </div>
            <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
              <mat-icon>menu_book</mat-icon>
            </div>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <span class="text-emerald-400 font-bold flex items-center">
              <mat-icon class="!text-sm">trending_up</mat-icon> 12%
            </span>
            <span class="text-slate-500">vs last month</span>
          </div>
        </div>

        <div class="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div class="flex justify-between items-start">
            <div class="space-y-1">
              <p class="text-sm font-medium text-slate-400">New Today</p>
              <p class="text-3xl font-bold">24</p>
            </div>
            <div class="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400">
              <mat-icon>add_circle</mat-icon>
            </div>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <span class="text-emerald-400 font-bold flex items-center">
              <mat-icon class="!text-sm">trending_up</mat-icon> 5%
            </span>
            <span class="text-slate-500">vs yesterday</span>
          </div>
        </div>

        <div class="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div class="flex justify-between items-start">
            <div class="space-y-1">
              <p class="text-sm font-medium text-slate-400">Total Reads</p>
              <p class="text-3xl font-bold">45.2k</p>
            </div>
            <div class="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-400">
              <mat-icon>visibility</mat-icon>
            </div>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <span class="text-rose-400 font-bold flex items-center">
              <mat-icon class="!text-sm">trending_down</mat-icon> 2%
            </span>
            <span class="text-slate-500">vs last week</span>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl">
          <div class="flex justify-between items-center mb-6">
            <h3 class="font-bold">Story Performance</h3>
            <select class="bg-slate-800 border-none rounded-lg text-xs font-bold py-1.5 pl-3 pr-8 focus:ring-0">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div class="h-64 flex items-end gap-2 relative">
            <!-- Mock Chart Visualization -->
            <div class="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
              <svg viewBox="0 0 400 100" class="w-full h-full stroke-primary stroke-2 fill-none">
                <path d="M0,80 Q50,20 100,60 T200,40 T300,70 T400,20" />
              </svg>
            </div>
            @for (day of ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']; track day; let idx = $index) {
              <div class="flex-1 flex flex-col items-center gap-2">
                <div class="w-full bg-primary/20 rounded-t-lg transition-all hover:bg-primary/40" [style.height.%]="[40, 60, 45, 80, 55, 90, 75][idx]"></div>
                <span class="text-[10px] font-bold text-slate-500">{{ day }}</span>
              </div>
            }
          </div>
        </div>

        <div class="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl">
          <div class="flex justify-between items-center mb-6">
            <h3 class="font-bold">User Engagement</h3>
            <a href="javascript:void(0)" class="text-xs font-bold text-primary hover:underline">View Detailed Report</a>
          </div>
          <div class="space-y-6">
            <div class="flex items-center justify-between">
              <div class="space-y-1">
                <p class="text-2xl font-bold">8.2k</p>
                <p class="text-xs text-slate-500">Avg. Daily Active Users</p>
              </div>
              <span class="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-full uppercase tracking-wider">Optimized</span>
            </div>
            <div class="grid grid-cols-7 gap-1">
              @for (i of [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21]; track i) {
                <div class="h-8 rounded-sm bg-slate-800/50" [class.bg-primary/60]="i % 3 === 0"></div>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Stories -->
      <div class="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
        <div class="p-6 flex justify-between items-center border-b border-slate-800">
          <h3 class="font-bold">Recent Stories</h3>
          <button routerLink="/stories/new" class="bg-primary hover:bg-primary/90 text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-all">
            <mat-icon class="!text-sm">add</mat-icon>
            New Story
          </button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-slate-800/30 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th class="px-6 py-4">Story Title</th>
                <th class="px-6 py-4">Category</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4">Reads</th>
                <th class="px-6 py-4">Date Created</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800">
              @for (story of data.stories(); track story.id) {
                <tr class="hover:bg-slate-800/20 transition-colors group cursor-pointer">
                  <td class="px-6 py-4">
                    <span class="font-bold text-sm">{{ story.title }}</span>
                  </td>
                  <td class="px-6 py-4 text-sm text-slate-400">{{ story.category_ids?.[0] || 'Uncategorized' }}</td>
                  <td class="px-6 py-4">
                    <span 
                      class="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400"
                    >
                      Published
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm font-mono">0</td>
                  <td class="px-6 py-4 text-sm text-slate-500">2023-10-24</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  data = inject(DataService);
}
