import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../data.service';
import { ApiService } from '../api.service';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Category, Language, Story, StoryTranslation } from '../models';
import { forkJoin, map, catchError, of } from 'rxjs';

@Component({
  selector: 'app-stories-management',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="space-y-8">
      <div class="flex justify-between items-end">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Content Management</h1>
          <p class="text-slate-400 mt-1">Manage your stories, categories, and series library.</p>
        </div>
        <div class="flex gap-3">
          @if (activeTab() === 'stories') {
            <button routerLink="/stories/new" class="bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 transition-all">
              <mat-icon>add</mat-icon>
              New Story
            </button>
          } @else if (activeTab() === 'categories') {
            <button (click)="openCategoryModal()" class="bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 transition-all">
              <mat-icon>add</mat-icon>
              New Category
            </button>
          } @else if (activeTab() === 'series') {
            <button routerLink="/series/new" class="bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 transition-all">
              <mat-icon>add</mat-icon>
              New Series
            </button>
          }
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-8 border-b border-slate-800">
        <button 
          (click)="activeTab.set('stories')" 
          [class.text-primary]="activeTab() === 'stories'"
          [class.border-primary]="activeTab() === 'stories'"
          class="pb-4 px-2 text-sm font-bold border-b-2 border-transparent transition-all"
        >
          Stories
        </button>
        <button 
          (click)="activeTab.set('categories')" 
          [class.text-primary]="activeTab() === 'categories'"
          [class.border-primary]="activeTab() === 'categories'"
          class="pb-4 px-2 text-sm font-bold border-b-2 border-transparent transition-all"
        >
          Categories
        </button>
        <button 
          (click)="activeTab.set('series')" 
          [class.text-primary]="activeTab() === 'series'"
          [class.border-primary]="activeTab() === 'series'"
          class="pb-4 px-2 text-sm font-bold border-b-2 border-transparent transition-all"
        >
          Series
        </button>
      </div>

      <!-- Search and Filter Bar -->
      <div class="flex gap-4">
        <div class="flex-1 relative group">
          <mat-icon class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">search</mat-icon>
          <input 
            type="text" 
            [placeholder]="'Search ' + activeTab() + '...'" 
            class="w-full bg-slate-900/40 border border-slate-800 rounded-xl py-2.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          />
        </div>
        <button class="px-4 py-2.5 border border-slate-800 rounded-xl flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
          <mat-icon class="!text-lg">filter_list</mat-icon>
          Filters
        </button>
      </div>

      <!-- Content Tables -->
      <div class="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
        <div class="overflow-x-auto">
          @if (activeTab() === 'stories') {
            @if (isLoadingStories()) {
              <div class="flex items-center justify-center py-16 gap-3 text-slate-500">
                <mat-icon class="animate-spin">autorenew</mat-icon>
                <span class="text-sm">Loading stories...</span>
              </div>
            } @else {
            <table class="w-full text-left">
              <thead class="bg-slate-800/30 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <tr>
                  <th class="px-6 py-4">Cover</th>
                  <th class="px-6 py-4">Translations</th>
                  <th class="px-6 py-4">Category</th>
                  <th class="px-6 py-4">Status</th>
                  <th class="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800">
                @for (story of data.stories(); track story.id) {
                  <tr class="hover:bg-slate-800/20 transition-colors group align-top">
                    <td class="px-6 py-4">
                      <div class="w-12 h-12 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0">
                        <img
                          [src]="story.photo_url || 'https://placehold.co/100x100/1e293b/64748b?text=S'"
                          (error)="$any($event.target).src='https://placehold.co/100x100/1e293b/64748b?text=S'"
                          class="w-full h-full object-cover"
                          alt="Story Cover"
                        />
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex flex-col gap-1.5">
                        @for (t of (story.storyTranslations ?? []); track t.id) {
                          <div class="flex items-center gap-2">
                            <span class="px-1.5 py-0.5 bg-slate-800 text-slate-400 text-[9px] font-bold rounded uppercase tracking-wider flex-shrink-0">
                              {{ t.language.country_code }}
                            </span>
                            <span class="text-sm font-bold">{{ t.title }}</span>
                          </div>
                        }
                        @empty {
                          <span class="text-sm text-slate-500 italic">Untitled</span>
                        }
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <span class="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded uppercase tracking-wider">
                        {{ getCategoryLabel(story.category_ids?.[0]) }}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        <span class="text-sm text-slate-300">Published</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <div class="flex justify-end gap-4">
                        <button [routerLink]="['/stories/edit', story.id]" class="text-xs font-bold text-primary hover:underline">Edit</button>
                        <button (click)="requestDelete(story.id, 'story', story.title)" class="text-xs font-bold text-rose-400 hover:underline">Delete</button>
                      </div>
                    </td>
                  </tr>
                }
                @empty {
                  <tr>
                    <td colspan="5" class="px-6 py-12 text-center text-slate-500 text-sm">No stories found.</td>
                  </tr>
                }
              </tbody>
            </table>
            }
          } @else if (activeTab() === 'categories') {
            @if (isLoadingCategories()) {
              <div class="flex items-center justify-center py-16 gap-3 text-slate-500">
                <mat-icon class="animate-spin">autorenew</mat-icon>
                <span class="text-sm">Loading categories...</span>
              </div>
            } @else {
            <table class="w-full text-left">
              <thead class="bg-slate-800/30 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <tr>
                  <th class="px-6 py-4">Cover</th>
                  <th class="px-6 py-4">Translations</th>
                  <th class="px-6 py-4">Stories</th>
                  <th class="px-6 py-4">Status</th>
                  <th class="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800">
                @for (cat of data.categories(); track cat.id) {
                  <tr class="hover:bg-slate-800/20 transition-colors group align-top">
                    <td class="px-6 py-4">
                      <div class="w-12 h-12 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0">
                        <img
                          [src]="cat.photo_url || 'https://placehold.co/100x100/1e293b/64748b?text=C'"
                          (error)="$any($event.target).src='https://placehold.co/100x100/1e293b/64748b?text=C'"
                          class="w-full h-full object-cover"
                          alt="Category Cover"
                        />
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex flex-col gap-1.5">
                        @for (t of (cat.categoryTranslations ?? []); track t.id) {
                          <div class="flex items-center gap-2">
                            <span class="px-1.5 py-0.5 bg-slate-800 text-slate-400 text-[9px] font-bold rounded uppercase tracking-wider flex-shrink-0">
                              {{ t.language.country_code }}
                            </span>
                            <span class="text-sm font-bold">{{ t.name }}</span>
                          </div>
                        }
                        @empty {
                          <span class="text-sm text-slate-500 italic">No translations</span>
                        }
                      </div>
                    </td>
                    <td class="px-6 py-4 text-sm text-slate-400">{{ cat._count?.storyCategories || 0 }}</td>
                    <td class="px-6 py-4">
                      <span class="px-2 py-1 bg-emerald-400/10 text-emerald-400 text-[10px] font-bold rounded uppercase tracking-wider">
                        Active
                      </span>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <div class="flex justify-end gap-4">
                        <button (click)="editCategory(cat)" class="text-xs font-bold text-primary hover:underline">Edit</button>
                        <button (click)="requestDelete(cat.id, 'category', cat.categoryTranslations?.[0]?.name || 'Category')" class="text-xs font-bold text-rose-400 hover:underline">Delete</button>
                      </div>
                    </td>
                  </tr>
                }
                @empty {
                  <tr>
                    <td colspan="5" class="px-6 py-12 text-center text-slate-500 text-sm">No categories found.</td>
                  </tr>
                }
              </tbody>
            </table>
            }
          } @else if (activeTab() === 'series') {
            <table class="w-full text-left">
              <thead class="bg-slate-800/30 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <tr>
                  <th class="px-6 py-4">Series Title</th>
                  <th class="px-6 py-4">Stories</th>
                  <th class="px-6 py-4">Rating</th>
                  <th class="px-6 py-4">Status</th>
                  <th class="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800">
                @for (s of series(); track s.id) {
                  <tr class="hover:bg-slate-800/20 transition-colors group">
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0">
                          <img src="https://picsum.photos/seed/series-{{s.id}}/100/100" class="w-full h-full object-cover" referrerpolicy="no-referrer" alt="Series Cover" />
                        </div>
                        <span class="text-sm font-bold">{{ s.titles['en'] }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-sm text-slate-400">{{ s.stories.length }} Stories</td>
                    <td class="px-6 py-4 text-sm text-slate-400">{{ s.contentRating }}</td>
                    <td class="px-6 py-4">
                      <span class="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded uppercase tracking-wider">
                        {{ s.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <div class="flex justify-end gap-4">
                        <button [routerLink]="['/series/edit', s.id]" class="text-xs font-bold text-primary hover:underline">Edit</button>
                        <button (click)="requestDelete(s.id, 'series', s.titles['en'])" class="text-xs font-bold text-rose-400 hover:underline">Delete</button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
      </div>
    </div>

    <!-- Category Modal -->
    @if (showCategoryModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <div class="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
          <div class="p-6 border-b border-slate-800 flex justify-between items-center">
            <div>
              <h2 class="text-xl font-bold">{{ editingCategory() ? 'Edit Category' : 'Create New Category' }}</h2>
              <p class="text-xs text-slate-500 mt-1">Add a new content section to your library</p>
            </div>
            <button (click)="closeCategoryModal()" class="text-slate-500 hover:text-white transition-colors">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <form [formGroup]="categoryForm" (ngSubmit)="saveCategory()" class="p-8 space-y-6">
            @if (categoryError()) {
              <div class="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">{{ categoryError() }}</div>
            }

            <!-- Language + Name -->
            <div class="space-y-4">
              <div class="flex items-center gap-2 text-primary text-[10px] font-bold uppercase tracking-widest">
                <mat-icon class="!text-sm">translate</mat-icon>
                Category Name
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="text-xs font-bold text-slate-500">Language *</label>
                  <select formControlName="language_id" class="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all">
                    <option value="">Select Language</option>
                    @for (lang of languages(); track lang.id) {
                      <option [value]="lang.id">{{ lang.name }}</option>
                    }
                  </select>
                </div>
                <div class="space-y-2">
                  <label class="text-xs font-bold text-slate-500">Name *</label>
                  <input formControlName="name" class="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="e.g. Science Fiction">
                </div>
              </div>
            </div>

            <!-- Cover Image -->
            <div class="space-y-4">
              <div class="flex items-center gap-2 text-primary text-[10px] font-bold uppercase tracking-widest">
                <mat-icon class="!text-sm">image</mat-icon>
                Cover Image {{ editingCategory() ? '(leave empty to keep current)' : '*' }}
              </div>
              <label class="aspect-[3/1] bg-slate-950/50 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-slate-800/30 transition-all group block overflow-hidden">
                @if (categoryPhotoPreview()) {
                  <img [src]="categoryPhotoPreview()" class="w-full h-full object-cover" alt="Category photo">
                } @else {
                  <div class="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
                    <mat-icon>cloud_upload</mat-icon>
                  </div>
                  <div class="text-center">
                    <p class="text-sm font-bold">Click to upload or drag and drop</p>
                    <p class="text-[10px] text-slate-500 mt-1">Recommended size: 1200x400px (Max 5MB)</p>
                  </div>
                }
                <input type="file" accept="image/*" class="hidden" (change)="onCategoryPhotoChange($event)">
              </label>
            </div>

            <div class="flex justify-end gap-4 pt-4">
              <button type="button" (click)="closeCategoryModal()" class="px-6 py-2.5 text-sm font-bold text-slate-400 hover:text-white transition-colors">Cancel</button>
              <button type="submit" [disabled]="categoryForm.invalid || isSavingCategory()" class="px-8 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all">
                {{ isSavingCategory() ? 'Saving...' : 'Save Category' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Delete Confirmation Modal -->
    @if (showDeleteModal()) {
      <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
        <div class="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
          <div class="p-8 text-center space-y-6">
            <div class="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <mat-icon class="!text-4xl">delete_forever</mat-icon>
            </div>
            
            <div class="space-y-2">
              <h2 class="text-2xl font-bold">Confirm Deletion</h2>
              <p class="text-slate-400 text-sm leading-relaxed">
                Are you sure you want to delete <span class="text-white font-bold">"{{ itemToDelete()?.name }}"</span>? 
                This action is permanent and cannot be undone.
              </p>
            </div>

            <div class="flex flex-col gap-3 pt-4">
              <button 
                (click)="confirmDelete()" 
                class="w-full py-3.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl shadow-lg shadow-rose-500/20 transition-all flex items-center justify-center gap-2"
              >
                <mat-icon class="!text-lg">delete</mat-icon>
                Delete Permanently
              </button>
              <button 
                (click)="closeDeleteModal()" 
                class="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl transition-all"
              >
                Keep it for now
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoriesManagementComponent implements OnInit {
  data = inject(DataService);
  private api = inject(ApiService);
  private fb = inject(FormBuilder);

  activeTab = signal('stories');
  isLoadingStories = signal(false);
  isLoadingCategories = signal(false);
  showCategoryModal = signal(false);
  editingCategory = signal<Category | null>(null);
  languages = signal<Language[]>([]);
  isSavingCategory = signal(false);
  categoryError = signal<string | null>(null);
  categoryPhotoPreview = signal<string | null>(null);
  private categoryPhotoFile: File | null = null;

  // Delete Modal State
  showDeleteModal = signal(false);
  itemToDelete = signal<{ id: string, type: 'story' | 'category' | 'series', name: string } | null>(null);

  series = computed(() => this.data.series());


  categoryForm = this.fb.group({
    language_id: ['', Validators.required],
    name: ['', Validators.required],
  });

  ngOnInit() {
    this.api.getLanguages().subscribe(langs => this.languages.set(langs));
    this.loadCategoriesAndStories();
  }

  private loadCategoriesAndStories() {
    this.isLoadingStories.set(true);
    this.isLoadingCategories.set(true);

    forkJoin({
      categories: this.api.getCategories().pipe(catchError(() => of([]))),
      stories: this.api.getAllStories().pipe(catchError(() => of([]))),
    }).pipe(
      map(({ categories, stories }) => {
        this.data.categories.set(categories);
        this.isLoadingCategories.set(false);

        const mapped: Story[] = (stories as any[]).map(story => {
          const translations: StoryTranslation[] = story.storyTranslations ?? [];
          const categoryIds: number[] = (story.storyCategories ?? []).map((sc: any) => sc.category?.id ?? sc.category_id);
          return {
            id: story.id,
            title: translations[0]?.title || 'Untitled',
            photo_url: story.photo_url,
            audio_url: story.audio_url,
            story_series_id: story.story_series_id,
            category_ids: categoryIds.filter(Boolean),
            storyTranslations: translations,
          } as Story;
        });

        return mapped;
      })
    ).subscribe({
      next: stories => {
        this.data.stories.set(stories);
        this.isLoadingStories.set(false);
      },
      error: () => {
        this.isLoadingStories.set(false);
        this.isLoadingCategories.set(false);
      },
    });
  }

  getCategoryLabel(categoryId?: number): string {
    if (!categoryId) return 'Uncategorized';
    const cat = this.data.getCategoryById(categoryId);
    return cat ? this.getCategoryName(cat) : String(categoryId);
  }

  getCategoryName(cat: Category): string {
    return cat.categoryTranslations?.find(t => t.language.id === 1)?.name ||
           cat.categoryTranslations?.[0]?.name || 'Unnamed Category';
  }

  getCategoryTranslation(cat: Category, langId: number): string {
    return cat.categoryTranslations?.find(t => t.language.id === langId)?.name || '';
  }

  openCategoryModal() {
    this.editingCategory.set(null);
    this.categoryForm.reset();
    this.categoryPhotoFile = null;
    this.categoryPhotoPreview.set(null);
    this.categoryError.set(null);
    this.showCategoryModal.set(true);
  }

  editCategory(cat: Category) {
    this.editingCategory.set(cat);
    const firstTranslation = cat.categoryTranslations?.[0];
    this.categoryForm.patchValue({
      language_id: firstTranslation ? String(firstTranslation.language.id) : '',
      name: firstTranslation?.name || '',
    });
    this.categoryPhotoFile = null;
    this.categoryPhotoPreview.set(cat.photo_url || null);
    this.categoryError.set(null);
    this.showCategoryModal.set(true);
  }

  closeCategoryModal() {
    this.showCategoryModal.set(false);
  }

  onCategoryPhotoChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.categoryPhotoFile = file;
    const reader = new FileReader();
    reader.onload = e => this.categoryPhotoPreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  saveCategory() {
    if (this.categoryForm.invalid || this.isSavingCategory()) return;
    const { language_id, name } = this.categoryForm.value;
    const editing = this.editingCategory();

    if (!editing && !this.categoryPhotoFile) {
      this.categoryError.set('A cover image is required.');
      return;
    }

    const formData = new FormData();
    formData.append('language_id', language_id!);
    formData.append('name', name!);
    if (this.categoryPhotoFile) formData.append('photo', this.categoryPhotoFile);

    this.isSavingCategory.set(true);
    this.categoryError.set(null);

    const request = editing
      ? this.api.updateCategory(editing.id, formData)
      : this.api.createCategory(formData);

    request.subscribe({
      next: (saved) => {
        const category = saved as Category;
        if (editing) {
          this.data.updateCategory(category);
        } else {
          this.data.addCategory(category);
        }
        this.isSavingCategory.set(false);
        this.closeCategoryModal();
      },
      error: (err) => {
        this.categoryError.set(err.error?.error || 'Failed to save category.');
        this.isSavingCategory.set(false);
      }
    });
  }

  // Delete Logic
  requestDelete(id: number, type: 'story' | 'category' | 'series', name: string) {
    this.itemToDelete.set({ id: id.toString(), type, name });
    this.showDeleteModal.set(true);
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.itemToDelete.set(null);
  }

  confirmDelete() {
    const item = this.itemToDelete();
    if (item) {
      const id = parseInt(item.id);
      if (item.type === 'story') this.data.deleteStory(id);
      else if (item.type === 'category') this.data.deleteCategory(id);
      else if (item.type === 'series') this.data.deleteSeries(id);
      
      this.closeDeleteModal();
    }
  }
}

