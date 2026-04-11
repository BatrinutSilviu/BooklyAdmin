import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../api.service';
import { DataService } from '../data.service';
import { Language, Story } from '../models';
import { concat, of, switchMap, toArray, map } from 'rxjs';

@Component({
  selector: 'app-create-story',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, RouterLink],
  template: `
    <div class="max-w-5xl mx-auto space-y-8 pb-20">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-4">
          <button routerLink="/stories" class="w-10 h-10 rounded-xl border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div>
            <h1 class="text-3xl font-bold tracking-tight">{{ editStoryId() ? 'Edit Story' : 'Create New Story' }}</h1>
            <p class="text-slate-400 mt-1">{{ editStoryId() ? 'Update the story details below.' : 'Fill in the details below to publish a new story.' }}</p>
          </div>
        </div>
        <button (click)="submit()" [disabled]="isSubmitting()" class="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          {{ isSubmitting() ? (editStoryId() ? 'Saving...' : 'Publishing...') : (editStoryId() ? 'Save Changes' : 'Publish Story') }}
        </button>
      </div>

      @if (error()) {
        <div class="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">{{ error() }}</div>
      }

      <form [formGroup]="storyForm" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main column -->
        <div class="lg:col-span-2 space-y-6">

          <!-- Translation tabs: language / title / description -->
          <section class="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
            <!-- Tab bar -->
            <div class="flex items-center gap-1 border-b border-slate-800 px-4 overflow-x-auto">
              @for (tCtrl of translations.controls; track $index; let ti = $index) {
                <button type="button" (click)="activeTab.set(ti)"
                  class="flex items-center gap-1.5 px-4 py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap flex-shrink-0"
                  [class.text-primary]="activeTab() === ti"
                  [class.border-primary]="activeTab() === ti"
                  [class.border-transparent]="activeTab() !== ti"
                  [class.text-slate-400]="activeTab() !== ti">
                  <mat-icon class="!text-base">translate</mat-icon>
                  {{ getTabLabel(ti) }}
                  @if (translations.length > 1) {
                    <span (click)="$event.stopPropagation(); removeTranslation(ti)"
                      class="w-4 h-4 flex items-center justify-center rounded-full text-slate-500 hover:bg-rose-500 hover:text-white transition-colors text-xs leading-none ml-1">
                      ✕
                    </span>
                  }
                </button>
              }
              <button type="button" (click)="addTranslation()"
                class="ml-2 flex-shrink-0 flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/10 rounded-lg transition-colors my-2">
                <mat-icon class="!text-sm">add</mat-icon>
                Add Language
              </button>
            </div>

            <!-- Per-translation fields (language, title, description) -->
            <div formArrayName="translations">
              @for (tCtrl of translations.controls; track $index; let ti = $index) {
                <div [formGroupName]="ti" [hidden]="activeTab() !== ti" class="p-8 space-y-5">
                  <div class="space-y-2">
                    <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Language</label>
                    <select formControlName="language_id"
                      class="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all">
                      <option value="">Select Language</option>
                      @for (lang of availableLanguages(ti); track lang.id) {
                        <option [value]="lang.id">{{ lang.name }}</option>
                      }
                    </select>
                  </div>
                  <div class="space-y-2">
                    <label class="text-sm font-bold text-slate-400 uppercase tracking-wider">Story Title</label>
                    <input formControlName="title"
                      class="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder="Enter story title">
                  </div>
                  <div class="space-y-2">
                    <label class="text-sm font-bold text-slate-400 uppercase tracking-wider">Description</label>
                    <textarea formControlName="description" rows="3"
                      class="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder="Enter story description"></textarea>
                  </div>
                </div>
              }
            </div>
          </section>

          <!-- Pages section — shared photos, per-language text -->
          <section class="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 space-y-6">
            <div class="flex justify-between items-center">
              <h3 class="text-xl font-bold flex items-center gap-2">
                <mat-icon class="text-primary">auto_stories</mat-icon>
                Story Pages
              </h3>
              <button (click)="addPage()" type="button"
                class="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                <mat-icon class="!text-sm">add</mat-icon>
                Add Page
              </button>
            </div>

            @if (pagePhotoPreviews().length === 0) {
              <p class="text-sm text-slate-500 italic">No pages yet. Click "Add Page" to start.</p>
            }

            <div class="space-y-6">
              @for (preview of pagePhotoPreviews(); track $index; let pi = $index) {
                <div class="p-6 bg-slate-950/30 border border-slate-800 rounded-xl relative group">
                  <button (click)="removePage(pi)" type="button"
                    class="absolute -top-3 -right-3 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all">
                    <mat-icon class="!text-sm">close</mat-icon>
                  </button>

                  <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Page {{ pi + 1 }}</p>

                  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <!-- Shared photo -->
                    <div class="space-y-2">
                      <span class="text-xs text-slate-500">Photo <span class="text-slate-600">(shared across languages)</span></span>
                      <label class="aspect-square bg-slate-900 rounded-xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-800/50 transition-all overflow-hidden block">
                        @if (preview) {
                          <img [src]="preview" class="w-full h-full object-cover" alt="Page photo">
                        } @else {
                          <mat-icon class="text-slate-600">add_a_photo</mat-icon>
                          <span class="text-[10px] font-bold text-slate-500">Upload Image</span>
                        }
                        <input type="file" accept="image/*" class="hidden" (change)="onPagePhotoChange($event, pi)">
                      </label>
                    </div>

                    <!-- Per-language text (bound to active translation) -->
                    <div class="md:col-span-2 space-y-2">
                      <span class="text-xs text-slate-500">Text <span class="text-slate-600">(for {{ getTabLabel(activeTab()) }})</span></span>
                      <textarea
                        [formControl]="getPageTextControl(activeTab(), pi)"
                        rows="9"
                        class="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        placeholder="Enter page text"></textarea>
                    </div>
                  </div>
                </div>
              }
            </div>
          </section>
        </div>

        <!-- Sidebar -->
        <div class="space-y-8">
          <section class="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 class="font-bold">Cover Image</h3>
            <label class="aspect-[3/4] bg-slate-900 rounded-xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-slate-800/50 transition-all group block overflow-hidden">
              @if (coverPhotoPreview()) {
                <img [src]="coverPhotoPreview()" class="w-full h-full object-cover" alt="Cover">
              } @else {
                <div class="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
                  <mat-icon>image</mat-icon>
                </div>
                <div class="text-center">
                  <p class="text-xs font-bold">Click to upload cover</p>
                  <p class="text-[10px] text-slate-500 mt-1">Recommended: 1200x1600px</p>
                </div>
              }
              <input type="file" accept="image/*" class="hidden" (change)="onCoverPhotoChange($event)">
            </label>
          </section>

          <section class="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 class="font-bold">Categories</h3>
            <div class="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              @for (cat of data.categories(); track cat.id) {
                <label class="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer hover:bg-slate-800/50 transition-colors"
                       [class.bg-primary/10]="isCategorySelected(cat.id)">
                  <input type="checkbox" [checked]="isCategorySelected(cat.id)" (change)="toggleCategory(cat.id)"
                    class="w-4 h-4 rounded accent-primary flex-shrink-0" />
                  <span class="text-sm font-medium">{{ getCategoryName(cat) }}</span>
                </label>
              }
              @empty {
                <p class="text-xs text-slate-500 italic">No categories available.</p>
              }
            </div>
          </section>
        </div>
      </form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateStoryComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  data = inject(DataService);

  languages = signal<Language[]>([]);
  isSubmitting = signal(false);
  error = signal<string | null>(null);
  coverPhotoPreview = signal<string | null>(null);
  // Shared across all translations — one entry per page
  pagePhotoFiles = signal<(File | null)[]>([]);
  pagePhotoPreviews = signal<(string | null)[]>([]);
  editStoryId = signal<number | null>(null);
  selectedCategoryIds = signal<number[]>([]);
  activeTab = signal(0);

  private coverPhotoFile: File | null = null;

  storyForm = this.fb.group({ translations: this.fb.array([]) });

  get translations(): FormArray { return this.storyForm.get('translations') as FormArray; }

  getPageTexts(tIdx: number): FormArray {
    return this.translations.at(tIdx).get('pageTexts') as FormArray;
  }

  getPageTextControl(tIdx: number, pIdx: number): FormControl {
    return this.getPageTexts(tIdx).at(pIdx).get('text_content') as FormControl;
  }

  getTabLabel(tIdx: number): string {
    const langId = this.translations.at(tIdx)?.get('language_id')?.value;
    if (!langId) return `Language ${tIdx + 1}`;
    return this.languages().find(l => String(l.id) === String(langId))?.name ?? `Language ${tIdx + 1}`;
  }

  availableLanguages(tIdx: number): Language[] {
    const taken = this.translations.controls
      .map((ctrl, i) => i !== tIdx ? String(ctrl.get('language_id')?.value) : null)
      .filter(Boolean);
    return this.languages().filter(l => !taken.includes(String(l.id)));
  }

  isCategorySelected(id: number): boolean { return this.selectedCategoryIds().includes(id); }

  toggleCategory(id: number) {
    this.selectedCategoryIds.update(ids => ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]);
  }

  getCategoryName(cat: unknown): string {
    const c = cat as { categoryTranslations?: { name: string; language: { id: number } }[] };
    return c.categoryTranslations?.find(t => t.language.id === 1)?.name
        || c.categoryTranslations?.[0]?.name
        || 'Unnamed Category';
  }

  private newPageTextGroup(): FormGroup {
    return this.fb.group({ text_content: ['', Validators.required] });
  }

  private newTranslationGroup(pageCount = 0): FormGroup {
    return this.fb.group({
      language_id: ['', Validators.required],
      title: ['', Validators.required],
      description: [''],
      pageTexts: this.fb.array(Array.from({ length: pageCount }, () => this.newPageTextGroup()))
    });
  }

  // Add a page to ALL translations
  addPage() {
    for (let i = 0; i < this.translations.length; i++) {
      this.getPageTexts(i).push(this.newPageTextGroup());
    }
    this.pagePhotoFiles.update(a => [...a, null]);
    this.pagePhotoPreviews.update(a => [...a, null]);
  }

  // Remove a page from ALL translations
  removePage(pIdx: number) {
    for (let i = 0; i < this.translations.length; i++) {
      this.getPageTexts(i).removeAt(pIdx);
    }
    this.pagePhotoFiles.update(a => a.filter((_, i) => i !== pIdx));
    this.pagePhotoPreviews.update(a => a.filter((_, i) => i !== pIdx));
  }

  addTranslation() {
    const pageCount = this.pagePhotoFiles().length;
    this.translations.push(this.newTranslationGroup(pageCount));
    this.activeTab.set(this.translations.length - 1);
  }

  removeTranslation(tIdx: number) {
    if (this.translations.length === 1) return;
    this.translations.removeAt(tIdx);
    this.activeTab.set(Math.min(this.activeTab(), this.translations.length - 1));
  }

  onCoverPhotoChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.coverPhotoFile = file;
    const reader = new FileReader();
    reader.onload = e => this.coverPhotoPreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  onPagePhotoChange(event: Event, pIdx: number) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.pagePhotoFiles.update(a => { const n = [...a]; n[pIdx] = file; return n; });
    const reader = new FileReader();
    reader.onload = e => {
      this.pagePhotoPreviews.update(a => { const n = [...a]; n[pIdx] = e.target?.result as string; return n; });
    };
    reader.readAsDataURL(file);
  }

  ngOnInit() {
    this.api.getLanguages().subscribe(langs => this.languages.set(langs));

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const storyId = parseInt(idParam, 10);
      this.editStoryId.set(storyId);
      this.prefillForm(storyId);
    } else {
      this.translations.push(this.newTranslationGroup(0));
    }
  }

  private prefillForm(storyId: number) {
    const story = this.data.getStoryById(storyId);
    if (!story) { this.translations.push(this.newTranslationGroup(0)); return; }

    if (story.photo_url) this.coverPhotoPreview.set(story.photo_url);
    this.selectedCategoryIds.set(story.category_ids ?? []);

    const tls = story.storyTranslations ?? [];
    if (tls.length === 0) { this.translations.push(this.newTranslationGroup(0)); return; }

    // Page photos come from the first translation (shared)
    const firstPages: any[] = (tls[0] as any).storyPages ?? [];
    this.pagePhotoFiles.set(firstPages.map(() => null));
    this.pagePhotoPreviews.set(firstPages.map((p: any) => p.photo_url ?? null));

    tls.forEach(t => {
      const rawPages: any[] = (t as any).storyPages ?? [];
      // Build pageTexts matching the page count from the first translation
      const pageTexts = this.fb.array(
        firstPages.map((_, i) => this.fb.group({
          text_content: [rawPages[i]?.text_content ?? '', Validators.required]
        }))
      );
      this.translations.push(this.fb.group({
        language_id: [String(t.language.id), Validators.required],
        title: [t.title, Validators.required],
        description: [t.description ?? ''],
        pageTexts
      }));
    });
  }

  private buildFormData(tIdx: number, isFirst: boolean): FormData {
    const t = this.translations.at(tIdx).value;
    const fd = new FormData();
    fd.append('language_id', t.language_id);
    fd.append('title', t.title);
    if (t.description) fd.append('description', t.description);

    if (isFirst) {
      const catIds = this.selectedCategoryIds();
      if (catIds.length > 0) fd.append('category_ids', JSON.stringify(catIds));
      if (this.coverPhotoFile) fd.append('story_photo', this.coverPhotoFile);
    }

    const pagesData = (t.pageTexts as { text_content: string }[]).map((p, i) => ({
      page_number: i + 1,
      text_content: p.text_content,
    }));
    fd.append('pages', JSON.stringify(pagesData));

    // Same page photos for every translation
    this.pagePhotoFiles().forEach((file, i) => {
      if (file) fd.append(`page_photo_${i + 1}`, file);
    });

    return fd;
  }

  submit() {
    if (this.storyForm.invalid || this.isSubmitting()) return;
    this.isSubmitting.set(true);
    this.error.set(null);

    const editId = this.editStoryId();
    const count = this.translations.length;

    if (editId) {
      const requests$ = Array.from({ length: count }, (_, i) =>
        this.api.updateStory(editId, this.buildFormData(i, i === 0))
      );
      concat(...requests$).pipe(toArray()).subscribe({
        next: (results) => {
          const last = results[results.length - 1] as any;
          this.data.updateStory({
            ...last,
            category_ids: (last.storyCategories ?? []).map((sc: any) => sc.category?.id ?? sc.category_id),
            storyTranslations: (last.storyTranslations ?? []).map((t: any) => ({
              id: t.id, title: t.title, description: t.description,
              language: t.language, storyPages: t.storyPages ?? [],
            })),
          } as Story);
          this.router.navigate(['/stories']);
        },
        error: (err) => {
          this.error.set(err.error?.error || 'Failed to update story.');
          this.isSubmitting.set(false);
        }
      });
    } else {
      this.api.createStory(this.buildFormData(0, true)).pipe(
        switchMap(result => {
          const storyId = (result as any).id;
          if (count === 1) return of(result);
          const rest$ = Array.from({ length: count - 1 }, (_, i) =>
            this.api.updateStory(storyId, this.buildFormData(i + 1, false))
          );
          return concat(...rest$).pipe(toArray(), map(() => result));
        })
      ).subscribe({
        next: () => this.router.navigate(['/stories']),
        error: (err) => {
          this.error.set(err.error?.error || 'Failed to create story.');
          this.isSubmitting.set(false);
        }
      });
    }
  }
}
