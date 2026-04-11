import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../api.service';
import { DataService } from '../data.service';
import { Language, Story } from '../models';

@Component({
  selector: 'app-create-story',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, RouterLink],
  template: `
    <div class="max-w-5xl mx-auto space-y-8 pb-20">
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
        <!-- Main Form Column -->
        <div class="lg:col-span-2 space-y-8">
          <!-- General Information -->
          <section class="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 space-y-6">
            <h3 class="text-xl font-bold flex items-center gap-2">
              <mat-icon class="text-primary">info</mat-icon>
              General Information
            </h3>

            <div class="space-y-6">
              <div class="space-y-2">
                <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Language</label>
                <select formControlName="language_id" class="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all">
                  <option value="">Select Language</option>
                  @for (lang of languages(); track lang.id) {
                    <option [value]="lang.id">{{ lang.name }}</option>
                  }
                </select>
              </div>

              <div class="space-y-2">
                <label class="text-sm font-bold text-slate-400 uppercase tracking-wider">Story Title</label>
                <input formControlName="title" class="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Enter story title">
              </div>

              <div class="space-y-2">
                <label class="text-sm font-bold text-slate-400 uppercase tracking-wider">Description</label>
                <textarea formControlName="description" rows="3" class="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Enter story description"></textarea>
              </div>
            </div>
          </section>

          <!-- Story Content (Pages) -->
          <section class="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 space-y-6">
            <div class="flex justify-between items-center">
              <h3 class="text-xl font-bold flex items-center gap-2">
                <mat-icon class="text-primary">auto_stories</mat-icon>
                Story Content
              </h3>
              <button (click)="addPage()" type="button" class="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                <mat-icon class="!text-sm">add</mat-icon>
                Add Page
              </button>
            </div>

            <div formArrayName="pages" class="space-y-8">
              @for (page of pages.controls; track page; let i = $index) {
                <div [formGroupName]="i" class="p-6 bg-slate-950/30 border border-slate-800 rounded-xl relative group">
                  <button (click)="removePage(i)" type="button" class="absolute -top-3 -right-3 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all">
                    <mat-icon class="!text-sm">close</mat-icon>
                  </button>

                  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <!-- Page Image -->
                    <div class="space-y-2">
                      <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Page {{i + 1}} Image</span>
                      <label class="aspect-square bg-slate-900 rounded-xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-800/50 transition-all overflow-hidden block">
                        @if (pagePhotoPreviews()[i]) {
                          <img [src]="pagePhotoPreviews()[i]" class="w-full h-full object-cover" alt="Page photo">
                        } @else {
                          <mat-icon class="text-slate-600">add_a_photo</mat-icon>
                          <span class="text-[10px] font-bold text-slate-500">Upload Image</span>
                        }
                        <input type="file" accept="image/*" class="hidden" (change)="onPagePhotoChange($event, i)">
                      </label>
                    </div>

                    <!-- Page Text -->
                    <div class="md:col-span-2 space-y-2">
                      <span class="text-xs font-bold text-slate-500">Page Text</span>
                      <textarea formControlName="text_content" rows="8" class="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Enter page text"></textarea>
                    </div>
                  </div>
                </div>
              }
            </div>
          </section>
        </div>

        <!-- Sidebar Column -->
        <div class="space-y-8">
          <!-- Cover Image -->
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

          <!-- Settings -->
          <section class="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h3 class="font-bold">Story Settings</h3>
            <div class="space-y-2">
              <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
              <select formControlName="category" class="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all">
                <option value="">Select Category</option>
                @for (cat of data.categories(); track cat.id) {
                  <option [value]="cat.id">{{ getCategoryName(cat) }}</option>
                }
              </select>
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
  pagePhotoFiles = signal<(File | null)[]>([]);
  pagePhotoPreviews = signal<(string | null)[]>([]);
  editStoryId = signal<number | null>(null);

  private coverPhotoFile: File | null = null;

  storyForm = this.fb.group({
    language_id: ['', Validators.required],
    title: ['', Validators.required],
    description: [''],
    category: [''],
    pages: this.fb.array([])
  });

  get pages() {
    return this.storyForm.get('pages') as FormArray;
  }

  getCategoryName(cat: unknown): string {
    const c = cat as { categoryTranslations?: { name: string, language: { id: number } }[] };
    return c.categoryTranslations?.find(t => t.language.id === 1)?.name ||
           c.categoryTranslations?.[0]?.name || 'Unnamed Category';
  }

  ngOnInit() {
    this.api.getLanguages().subscribe(langs => this.languages.set(langs));

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const storyId = parseInt(idParam, 10);
      this.editStoryId.set(storyId);
      this.prefillForm(storyId);
    } else {
      this.addPage();
    }
  }

  private prefillForm(storyId: number) {
    const story = this.data.getStoryById(storyId);
    if (!story) { this.addPage(); return; }

    const firstTranslation = story.storyTranslations?.[0];
    this.storyForm.patchValue({
      language_id: firstTranslation ? String(firstTranslation.language.id) : '',
      title: firstTranslation?.title || '',
      description: firstTranslation?.description || '',
      category: story.category_ids?.[0] ? String(story.category_ids[0]) : '',
    });

    if (story.photo_url) {
      this.coverPhotoPreview.set(story.photo_url);
    }

    // Pre-fill pages from the story's first translation
    const pages = (firstTranslation as any)?.storyPages ?? [];
    if (pages.length > 0) {
      pages.forEach((p: any) => {
        this.pages.push(this.fb.group({ text_content: [p.text_content, Validators.required] }));
        this.pagePhotoFiles.update(a => [...a, null]);
        this.pagePhotoPreviews.update(a => [...a, p.photo_url || null]);
      });
    } else {
      this.addPage();
    }
  }

  addPage() {
    this.pages.push(this.fb.group({ text_content: ['', Validators.required] }));
    this.pagePhotoFiles.update(a => [...a, null]);
    this.pagePhotoPreviews.update(a => [...a, null]);
  }

  removePage(index: number) {
    this.pages.removeAt(index);
    this.pagePhotoFiles.update(a => a.filter((_, i) => i !== index));
    this.pagePhotoPreviews.update(a => a.filter((_, i) => i !== index));
  }

  onCoverPhotoChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.coverPhotoFile = file;
    const reader = new FileReader();
    reader.onload = e => this.coverPhotoPreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  onPagePhotoChange(event: Event, index: number) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.pagePhotoFiles.update(a => { const n = [...a]; n[index] = file; return n; });
    const reader = new FileReader();
    reader.onload = e => {
      this.pagePhotoPreviews.update(a => { const n = [...a]; n[index] = e.target?.result as string; return n; });
    };
    reader.readAsDataURL(file);
  }

  submit() {
    if (this.storyForm.invalid || this.isSubmitting()) return;
    this.isSubmitting.set(true);
    this.error.set(null);

    const v = this.storyForm.value;
    const formData = new FormData();
    formData.append('language_id', v.language_id!);
    formData.append('title', v.title!);
    if (v.description) formData.append('description', v.description);
    if (v.category) formData.append('category_ids', JSON.stringify([parseInt(v.category)]));
    if (this.coverPhotoFile) formData.append('story_photo', this.coverPhotoFile);

    const pagesData = (v.pages as { text_content: string }[]).map((p, i) => ({
      page_number: i + 1,
      text_content: p.text_content
    }));
    formData.append('pages', JSON.stringify(pagesData));

    this.pagePhotoFiles().forEach((file, i) => {
      if (file) formData.append(`page_photo_${i + 1}`, file);
    });

    const editId = this.editStoryId();
    const request$ = editId
      ? this.api.updateStory(editId, formData)
      : this.api.createStory(formData);

    request$.subscribe({
      next: (saved) => {
        if (editId) {
          const story = saved as Story;
          const mapped = {
            ...story,
            category_ids: (story as any).storyCategories?.map((sc: any) => sc.category?.id ?? sc.category_id) ?? [],
            storyTranslations: (story as any).storyTranslations ?? [],
          } as Story;
          this.data.updateStory(mapped);
        }
        this.router.navigate(['/stories']);
      },
      error: (err) => {
        this.error.set(err.error?.error || `Failed to ${editId ? 'update' : 'create'} story. Please try again.`);
        this.isSubmitting.set(false);
      }
    });
  }
}
