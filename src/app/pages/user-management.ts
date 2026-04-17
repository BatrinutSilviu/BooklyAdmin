import { Component, ChangeDetectionStrategy, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap, catchError, debounceTime } from 'rxjs/operators';
import { of } from 'rxjs';
import { ApiService } from '../api.service';
import { MatIconModule } from '@angular/material/icon';
import { UserWithDetails, PaginatedResponse } from '../models';

const EMPTY_PAGE: PaginatedResponse<UserWithDetails> = {
  data: [],
  pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
};

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
          <p class="text-2xl font-bold">{{ pagination()?.total ?? '—' }}</p>
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

      <!-- Filters -->
      <div class="flex flex-wrap gap-3">
        <div class="flex-1 min-w-[200px] relative group">
          <mat-icon class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors !text-lg">search</mat-icon>
          <input
            type="text"
            placeholder="Search by profile name…"
            [value]="nameInput()"
            (input)="nameInput.set($any($event.target).value)"
            class="w-full bg-slate-900/40 border border-slate-800 rounded-xl py-2.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          />
        </div>
        <select
          [value]="roleFilter()"
          (change)="roleFilter.set($any($event.target).value); page.set(1)"
          class="bg-slate-900/40 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-slate-300 outline-none focus:border-primary cursor-pointer"
        >
          <option value="">All Roles</option>
          @for (r of roleOptions; track r.value) {
            <option [value]="r.value">{{ r.label }}</option>
          }
        </select>
      </div>

      <!-- User Directory Table -->
      <div class="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
        <div class="p-6 border-b border-slate-800">
          <h3 class="font-bold">User Directory</h3>
        </div>

        @if (isLoading()) {
          <div class="p-12 flex flex-col items-center gap-3 text-slate-500">
            <mat-icon class="!text-4xl animate-spin">refresh</mat-icon>
            <p class="text-sm">Loading users…</p>
          </div>
        } @else if (!users()?.length) {
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
                  <th class="px-6 py-4"></th>
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
                    <td class="px-6 py-4 text-right">
                      @if (user.role !== 'admin') {
                        <button
                          (click)="deleteUser(user)"
                          [disabled]="deleting() === user.id"
                          class="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Delete user"
                        >
                          @if (deleting() === user.id) {
                            <mat-icon class="!text-lg animate-spin">refresh</mat-icon>
                          } @else {
                            <mat-icon class="!text-lg">delete</mat-icon>
                          }
                        </button>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div class="p-4 border-t border-slate-800 bg-slate-900/20 flex items-center justify-between">
            <p class="text-xs text-slate-500">{{ pagination()?.total ?? 0 }} users total · Page {{ page() }} of {{ pagination()?.totalPages ?? 1 }}</p>
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-2">
                <span class="text-xs text-slate-500">Per page</span>
                <select
                  (change)="changeLimit(+$any($event.target).value)"
                  class="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-300 outline-none focus:border-primary cursor-pointer"
                >
                  @for (opt of pageSizeOptions; track opt) {
                    <option [value]="opt" [selected]="opt === limit()">{{ opt }}</option>
                  }
                </select>
              </div>
              <div class="flex items-center gap-2">
                <button
                  (click)="changePage(page() - 1)"
                  [disabled]="page() === 1"
                  class="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold transition-all flex items-center gap-1"
                ><mat-icon class="!text-sm">chevron_left</mat-icon>Prev</button>
                <button
                  (click)="changePage(page() + 1)"
                  [disabled]="page() === pagination()?.totalPages"
                  class="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold transition-all flex items-center gap-1"
                >Next<mat-icon class="!text-sm">chevron_right</mat-icon></button>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserManagementComponent {
  private api = inject(ApiService);

  readonly pageSizeOptions = [10, 20, 50, 100];
  readonly roleOptions = [
    { value: 'admin', label: 'Admin' },
    { value: 'authenticated', label: 'User' },
  ];

  page = signal(1);
  limit = signal(10);
  nameInput = signal('');
  roleFilter = signal('');
  deleting = signal<string | null>(null);
  private _deletedIds = signal<Set<string>>(new Set());

  private _nameD = toSignal(
    toObservable(this.nameInput).pipe(debounceTime(350)),
    { initialValue: '' }
  );

  // Reset to page 1 whenever filters change
  private _resetPage = effect(() => {
    this._nameD(); this.roleFilter();
    this.page.set(1);
  }, { allowSignalWrites: true });

  private _params = computed(() => ({
    page: this.page(),
    limit: this.limit(),
    name: this._nameD() || undefined,
    role: this.roleFilter() || undefined,
  }));

  private _response = toSignal(
    toObservable(this._params).pipe(
      switchMap(({ page, limit, name, role }) =>
        this.api.getUsers(page, limit, { name, role }).pipe(catchError(() => of(EMPTY_PAGE)))
      )
    )
  );

  isLoading = computed(() => this._response() === undefined);
  pagination = computed(() => this._response()?.pagination);

  users = computed(() => {
    const data = this._response()?.data;
    if (!data) return undefined;
    const deleted = this._deletedIds();
    return deleted.size ? data.filter(u => !deleted.has(u.id)) : data;
  });

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

  changePage(page: number) {
    const total = this.pagination()?.totalPages ?? 1;
    if (page < 1 || page > total) return;
    this._deletedIds.set(new Set());
    this.page.set(page);
  }

  changeLimit(limit: number) {
    this._deletedIds.set(new Set());
    this.limit.set(limit);
    this.page.set(1);
  }

  deleteUser(user: UserWithDetails) {
    this.deleting.set(user.id);
    this.api.deleteUser(user.id).subscribe({
      next: () => {
        this._deletedIds.update(set => new Set([...set, user.id]));
        this.deleting.set(null);
      },
      error: () => this.deleting.set(null),
    });
  }
}
