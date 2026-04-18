import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, switchMap, catchError, of } from 'rxjs';
import { ApiService } from '../api.service';
import { Story } from '../models';

@Component({
  selector: 'app-create-series',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, RouterLink],
  template: `
    <div class="max-w-3xl mx-auto space-y-8 pb-20">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-4">
          <button routerLink="/stories" class="w-10 h-10 rounded-xl border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div>
            <h1 class="text-3xl font-bold tracking-tight">{{ isEdit ? 'Edit Series' : 'Create New Series' }}</h1>
            <p class="text-slate-400 mt-1">{{ isEdit ? 'Update the series details below.' : 'Fill in the details below to create a new series.' }}</p>
          </div>
        </div>
        <button (click)="submit()" [disabled]="form.invalid || isSubmitting()"
          class="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          {{ isSubmitting() ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create Series') }}
        </button>
      </div>

      @if (error()) {
        <div class="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">{{ error() }}</div>
      }

      <!-- Name -->
      <section class="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 space-y-4">
        <h3 class="font-bold flex items-center gap-2">
          <mat-icon class="text-primary">label</mat-icon>
          Series Name
        </h3>
        <form [formGroup]="form">
          <input formControlName="name"
            class="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            placeholder="e.g. The Chronicles of Elowen" />
        </form>
      </section>

      <!-- Stories selector -->
      <section class="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 space-y-6">
        <div class="flex justify-between items-center">
          <h3 class="font-bold flex items-center gap-2">
            <mat-icon class="text-primary">auto_stories</mat-icon>
            Stories
          </h3>
          @if (selectedIds().length > 0) {
            <span class="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">
              {{ selectedIds().length }} selected
            </span>
          }
        </div>

        <div class="relative group">
          <mat-icon class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">search</mat-icon>
          <input type="text" placeholder="Search all stories by title…"
            (input)="searchQuery.set($any($event.target).value)"
            class="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
        </div>

        <div class="space-y-2 max-h-[480px] overflow-y-auto pr-1">
          @if (isSearching()) {
            <div class="flex items-center justify-center py-8 gap-3 text-slate-500">
              <mat-icon class="animate-spin">autorenew</mat-icon>
              <span class="text-sm">Loading...</span>
            </div>
          } @else {
            @for (story of stories(); track story.id) {
              <label class="flex items-center gap-4 p-4 bg-slate-950/30 border rounded-2xl cursor-pointer transition-all select-none"
                [class.border-primary/50]="isSelected(story.id)"
                [class.bg-primary/5]="isSelected(story.id)"
                [class.border-slate-800]="!isSelected(story.id)">
                <input type="checkbox" [checked]="isSelected(story.id)" (change)="toggle(story.id)"
                  class="w-4 h-4 rounded accent-primary flex-shrink-0" />
                <div class="w-12 h-12 rounded-xl bg-slate-800 overflow-hidden flex-shrink-0">
                  <img [src]="story.photo_url || 'https://placehold.co/100x100/1e293b/64748b?text=S'"
                    (error)="$any($event.target).src='https://placehold.co/100x100/1e293b/64748b?text=S'"
                    class="w-full h-full object-cover" alt="Cover" />
                </div>
                <span class="flex-1 text-sm font-bold">{{ story.title }}</span>
              </label>
            }
            @empty {
              <p class="text-sm text-slate-500 italic text-center py-4">No stories found.</p>
            }
          }
        </div>
      </section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateSeriesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);

  isEdit = false;
  seriesId: number | null = null;
  isSubmitting = signal(false);
  error = signal<string | null>(null);
  selectedIds = signal<number[]>([]);
  searchQuery = signal('');

  form = this.fb.group({ name: ['', Validators.required] });

  private _searchDebounced = toSignal(
    toObservable(this.searchQuery).pipe(debounceTime(350)),
    { initialValue: '' }
  );

  private _raw = toSignal(
    toObservable(this._searchDebounced).pipe(
      switchMap(q =>
        this.api.getAllStories(1, 50, { name: q || undefined }).pipe(
          catchError(() => of({ data: [], pagination: { total: 0, page: 1, limit: 50, totalPages: 0 } }))
        )
      )
    )
  );

  isSearching = computed(() => this._raw() === undefined);

  stories = computed(() =>
    (this._raw()?.data as any[] ?? []).map((s: any) => ({
      id: s.id,
      title: (s.storyTranslations?.find((t: any) => t.language?.country_code?.toUpperCase() === 'EN') ?? s.storyTranslations?.[0])?.title || 'Untitled',
      photo_url: s.photo_url,
      status: s.status,
    } as Story))
  );

  isSelected(id: number) { return this.selectedIds().includes(id); }

  toggle(id: number) {
    this.selectedIds.update(ids => ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]);
  }

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = true;
      this.seriesId = parseInt(idParam, 10);
      this.api.getStorySeriesById(this.seriesId).subscribe({
        next: (series) => {
          this.form.patchValue({ name: series.name });
          const ids = (series.storySeriesStories ?? []).map(s => s.story_id);
          this.selectedIds.set(ids);
        }
      });
    }
  }

  submit() {
    if (this.form.invalid || this.isSubmitting()) return;
    this.isSubmitting.set(true);
    this.error.set(null);

    const body = { name: this.form.value.name!, story_ids: this.selectedIds() };

    const req$ = this.isEdit && this.seriesId
      ? this.api.updateStorySeries(this.seriesId, body)
      : this.api.createStorySeries(body);

    req$.subscribe({
      next: () => this.router.navigate(['/stories'], { queryParams: { tab: 'series' } }),
      error: (err) => {
        this.error.set(err.error?.error || `Failed to ${this.isEdit ? 'update' : 'create'} series.`);
        this.isSubmitting.set(false);
      }
    });
  }
}
