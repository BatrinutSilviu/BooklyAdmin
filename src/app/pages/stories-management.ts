import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../data.service';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Category } from '../models';

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
            <table class="w-full text-left">
              <thead class="bg-slate-800/30 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <tr>
                  <th class="px-6 py-4">Title</th>
                  <th class="px-6 py-4">Author</th>
                  <th class="px-6 py-4">Category</th>
                  <th class="px-6 py-4">Status</th>
                  <th class="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800">
                @for (story of data.stories(); track story.id) {
                  <tr class="hover:bg-slate-800/20 transition-colors group">
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0">
                          <img src="https://picsum.photos/seed/{{story.id}}/100/100" class="w-full h-full object-cover" referrerpolicy="no-referrer" alt="Story Cover" />
                        </div>
                        <span class="text-sm font-bold">{{ story.title }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-sm text-slate-400">System</td>
                    <td class="px-6 py-4">
                      <span class="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded uppercase tracking-wider">
                        {{ story.category_ids?.[0] || 'Uncategorized' }}
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
              </tbody>
            </table>
          } @else if (activeTab() === 'categories') {
            <table class="w-full text-left">
              <thead class="bg-slate-800/30 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <tr>
                  <th class="px-6 py-4">Category Name</th>
                  <th class="px-6 py-4">Priority</th>
                  <th class="px-6 py-4">Status</th>
                  <th class="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800">
                @for (cat of data.categories(); track cat.id) {
                  <tr class="hover:bg-slate-800/20 transition-colors group">
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0">
                          <img src="https://picsum.photos/seed/cat-{{cat.id}}/100/100" class="w-full h-full object-cover" referrerpolicy="no-referrer" alt="Category Cover" />
                        </div>
                        <div>
                          <p class="text-sm font-bold">{{ getCategoryName(cat) }}</p>
                          <p class="text-[10px] text-slate-500">{{ getCategoryTranslation(cat, 2) }}</p>
                        </div>
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
                        <button (click)="requestDelete(cat.id, 'category', getCategoryName(cat))" class="text-xs font-bold text-rose-400 hover:underline">Delete</button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
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

          <form [formGroup]="categoryForm" (ngSubmit)="saveCategory()" class="p-8 space-y-8">
            <!-- Title Translations -->
            <div class="space-y-4">
              <div class="flex items-center gap-2 text-primary text-[10px] font-bold uppercase tracking-widest">
                <mat-icon class="!text-sm">translate</mat-icon>
                Title Translations (Mandatory)
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label for="title_en" class="text-xs font-bold text-slate-500">English Title *</label>
                  <input id="title_en" formControlName="title_en" class="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="e.g. Science Fiction">
                </div>
                <div class="space-y-2">
                  <label for="title_es" class="text-xs font-bold text-slate-500">Spanish Title *</label>
                  <input id="title_es" formControlName="title_es" class="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="e.g. Ciencia Ficción">
                </div>
                <div class="space-y-2">
                  <label for="title_fr" class="text-xs font-bold text-slate-500">French Title *</label>
                  <input id="title_fr" formControlName="title_fr" class="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="e.g. Science-fiction">
                </div>
                <div class="space-y-2">
                  <label for="title_de" class="text-xs font-bold text-slate-500">German Title *</label>
                  <input id="title_de" formControlName="title_de" class="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="e.g. Science-Fiction">
                </div>
              </div>
            </div>

            <!-- Cover Image -->
            <div class="space-y-4">
              <div class="flex items-center gap-2 text-primary text-[10px] font-bold uppercase tracking-widest">
                <mat-icon class="!text-sm">image</mat-icon>
                Cover Image
              </div>
              <div class="aspect-[3/1] bg-slate-950/50 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-slate-800/30 transition-all group">
                <div class="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
                  <mat-icon>cloud_upload</mat-icon>
                </div>
                <div class="text-center">
                  <p class="text-sm font-bold">Click to upload or drag and drop</p>
                  <p class="text-[10px] text-slate-500 mt-1">Recommended size: 1200x400px (Max 5MB)</p>
                </div>
              </div>
            </div>

            <!-- Settings -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label for="status" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Visibility Status</label>
                <select id="status" formControlName="status" class="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div class="space-y-2">
                <label for="priority" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Display Priority</label>
                <input id="priority" type="number" formControlName="priority" class="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="0">
              </div>
            </div>

            <div class="flex justify-end gap-4 pt-4">
              <button type="button" (click)="closeCategoryModal()" class="px-6 py-2.5 text-sm font-bold text-slate-400 hover:text-white transition-colors">Cancel</button>
              <button type="submit" [disabled]="categoryForm.invalid" class="px-8 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all">
                Save Category
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
export class StoriesManagementComponent {
  data = inject(DataService);
  private fb = inject(FormBuilder);
  
  activeTab = signal('stories');
  showCategoryModal = signal(false);
  editingCategory = signal<Category | null>(null);
  
  // Delete Modal State
  showDeleteModal = signal(false);
  itemToDelete = signal<{ id: string, type: 'story' | 'category' | 'series', name: string } | null>(null);

  series = computed(() => this.data.series());

  categoryForm = this.fb.group({
    title_en: ['', Validators.required],
    title_es: ['', Validators.required],
    title_fr: ['', Validators.required],
    title_de: ['', Validators.required],
    status: ['Active' as 'Active' | 'Inactive'],
    priority: [0]
  });

  getCategoryName(cat: Category): string {
    return cat.categoryTranslations.find(t => t.language.id === 1)?.name || 
           cat.categoryTranslations[0]?.name || 'Unnamed Category';
  }

  getCategoryTranslation(cat: Category, langId: number): string {
    return cat.categoryTranslations.find(t => t.language.id === langId)?.name || '';
  }

  openCategoryModal() {
    this.editingCategory.set(null);
    this.categoryForm.reset({ status: 'Active', priority: 0 });
    this.showCategoryModal.set(true);
  }

  editCategory(cat: Category) {
    this.editingCategory.set(cat);
    this.categoryForm.patchValue({
      title_en: this.getCategoryTranslation(cat, 1),
      title_es: this.getCategoryTranslation(cat, 2),
      title_fr: this.getCategoryTranslation(cat, 3),
      title_de: this.getCategoryTranslation(cat, 4),
      status: 'Active', // Mocked as spec doesn't have status in Category directly
      priority: 0
    });
    this.showCategoryModal.set(true);
  }

  closeCategoryModal() {
    this.showCategoryModal.set(false);
  }

  saveCategory() {
    if (this.categoryForm.valid) {
      const formValue = this.categoryForm.value;
      const categoryData: Category = {
        id: 0,
        created_at: new Date().toISOString(),
        categoryTranslations: [
          { id: 0, name: formValue.title_en || '', language: { id: 1, name: 'English', country_code: 'US' } },
          { id: 0, name: formValue.title_es || '', language: { id: 2, name: 'Spanish', country_code: 'ES' } },
          { id: 0, name: formValue.title_fr || '', language: { id: 3, name: 'French', country_code: 'FR' } },
          { id: 0, name: formValue.title_de || '', language: { id: 4, name: 'German', country_code: 'DE' } }
        ]
      };

      const currentEditing = this.editingCategory();
      if (currentEditing) {
        categoryData.id = currentEditing.id;
        this.data.updateCategory(categoryData);
      } else {
        categoryData.id = Math.floor(Math.random() * 1000);
        this.data.addCategory(categoryData);
      }
      
      this.closeCategoryModal();
    }
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

