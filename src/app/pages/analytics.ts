import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="space-y-8">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Analytics</h1>
        <p class="text-slate-400 mt-1">Deep dive into your content performance and user engagement.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        @for (stat of stats; track stat.label) {
          <div class="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-4">
            <div class="flex justify-between items-start">
              <div class="space-y-1">
                <p class="text-sm font-medium text-slate-400">{{stat.label}}</p>
                <p class="text-3xl font-bold">{{stat.value}}</p>
              </div>
              <div [class]="'w-10 h-10 rounded-lg flex items-center justify-center ' + stat.color">
                <mat-icon>{{stat.icon}}</mat-icon>
              </div>
            </div>
            <div class="flex items-center gap-2 text-sm">
              <span class="text-emerald-400 font-bold flex items-center">
                <mat-icon class="!text-sm">trending_up</mat-icon>
                {{stat.trend}}
              </span>
              <span class="text-slate-500">vs last month</span>
            </div>
          </div>
        }
      </div>

      <div class="bg-slate-900/40 border border-slate-800 p-8 rounded-2xl flex flex-col items-center justify-center min-h-[400px] text-center">
        <div class="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
          <mat-icon class="!text-4xl">bar_chart</mat-icon>
        </div>
        <h2 class="text-2xl font-bold mb-2">Advanced Charts Coming Soon</h2>
        <p class="text-slate-400 max-w-md">We're currently building out the full analytics suite. Check back soon for detailed visualizations and heatmaps.</p>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class AnalyticsComponent {
  stats = [
    { label: 'Total Views', value: '1.2M', icon: 'visibility', color: 'bg-primary/10 text-primary', trend: '12%' },
    { label: 'Avg. Read Time', value: '4m 32s', icon: 'timer', color: 'bg-indigo-500/10 text-indigo-400', trend: '8%' },
    { label: 'Completion Rate', value: '64%', icon: 'check_circle', color: 'bg-emerald-500/10 text-emerald-400', trend: '3%' },
    { label: 'New Subscribers', value: '2,840', icon: 'person_add', color: 'bg-purple-500/10 text-purple-400', trend: '15%' }
  ];
}
