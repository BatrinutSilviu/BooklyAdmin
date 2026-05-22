import { Component, ChangeDetectionStrategy, inject, signal, computed, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { DataService } from '../data.service';
import { ApiService } from '../api.service';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators } from '@angular/forms';
import { Book, Category, BookTranslation, Language } from '../models';
import { catchError, concat, debounceTime, of, switchMap, toArray, map } from 'rxjs';

@Component({
  selector: 'app-books-management',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="space-y-8">
      <div class="flex justify-between items-end">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Content Management</h1>
          <p class="text-slate-400 mt-1">Manage your books and categories library.</p>
        </div>
        <div class="flex gap-3">
          @if (activeTab() === 'books') {
            <button routerLink="/books/new" class="bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 transition-all">
              <mat-icon>add</mat-icon>
              New Book
            </button>
          } @else if (activeTab() === 'categories') {
            <button (click)="openCategoryModal()" class="bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 transition-all">
              <mat-icon>add</mat-icon>
              New Category
            </button>
          }
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-8 border-b border-slate-800">
        <button
          (click)="activeTab.set('books')"
          [class.text-primary]="activeTab() === 'books'"
          [class.border-primary]="activeTab() === 'books'"
          class="pb-4 px-2 text-sm font-bold border-b-2 border-transparent transition-all">
          Books
        </button>
        <button
          (click)="activeTab.set('categories')"
          [class.text-primary]="activeTab() === 'categories'"
          [class.border-primary]="activeTab() === 'categories'"
          class="pb-4 px-2 text-sm font-bold border-b-2 border-transparent transition-all">
          Categories
        </button>
      </div>

      <!-- Filters (per-tab) -->
      @if (activeTab() === 'books') {
        <div class="flex flex-wrap gap-3">
          <div class="flex-1 min-w-[200px] relative group">
            <mat-icon class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors !text-lg">search</mat-icon>
            <input type="text" placeholder="Search books by title…" [value]="booksNameInput()"
              (input)="booksNameInput.set($any($event.target).value)"
              class="w-full bg-slate-900/40 border border-slate-800 rounded-xl py-2.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"/>
          </div>
          <select [value]="booksLanguageId() ?? ''"
            (change)="booksLanguageId.set(+$any($event.target).value || null); booksPage.set(1)"
            class="bg-slate-900/40 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-slate-300 outline-none focus:border-primary cursor-pointer">
            <option value="">All Languages</option>
            @for (lang of languages(); track lang.id) {
              <option [value]="lang.id">{{ lang.name }}</option>
            }
          </select>
          <select [value]="booksCategoryId() ?? ''"
            (change)="booksCategoryId.set(+$any($event.target).value || null); booksPage.set(1)"
            class="bg-slate-900/40 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-slate-300 outline-none focus:border-primary cursor-pointer">
            <option value="">All Categories</option>
            @for (cat of categoriesLookup(); track cat.id) {
              <option [value]="cat.id">{{ getCategoryName(cat) }}</option>
            }
          </select>
        </div>
      } @else if (activeTab() === 'categories') {
        <div class="flex flex-wrap gap-3">
          <div class="flex-1 min-w-[200px] relative group">
            <mat-icon class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors !text-lg">search</mat-icon>
            <input type="text" placeholder="Search categories by name…" [value]="categoriesNameInput()"
              (input)="categoriesNameInput.set($any($event.target).value)"
              class="w-full bg-slate-900/40 border border-slate-800 rounded-xl py-2.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"/>
          </div>
          <select [value]="categoriesLanguageId() ?? ''"
            (change)="categoriesLanguageId.set(+$any($event.target).value || null); categoriesPage.set(1)"
            class="bg-slate-900/40 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-slate-300 outline-none focus:border-primary cursor-pointer">
            <option value="">All Languages</option>
            @for (lang of languages(); track lang.id) {
              <option [value]="lang.id">{{ lang.name }}</option>
            }
          </select>
        </div>
      }

      <!-- Content Tables -->
      <div class="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
        <div class="overflow-x-auto">
          @if (activeTab() === 'books') {
            @if (isLoadingBooks()) {
              <div class="flex items-center justify-center py-16 gap-3 text-slate-500">
                <mat-icon class="animate-spin">autorenew</mat-icon>
                <span class="text-sm">Loading books...</span>
              </div>
            } @else {
            <table class="w-full text-left">
              <thead class="bg-slate-800/30 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <tr>
                  <th class="px-6 py-4">Cover</th>
                  <th class="px-6 py-4">Translations</th>
                  <th class="px-6 py-4">Categories</th>
                  <th class="px-6 py-4">Duration</th>
                  <th class="px-6 py-4">Status</th>
                  <th class="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800">
                @for (book of data.books(); track book.id) {
                  <tr class="hover:bg-slate-800/20 transition-colors group align-top">
                    <td class="px-6 py-4">
                      <div class="w-12 h-16 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0">
                        <img
                          [src]="book.photo_url || 'https://placehold.co/100x133/1e293b/64748b?text=B'"
                          (error)="$any($event.target).src='https://placehold.co/100x133/1e293b/64748b?text=B'"
                          class="w-full h-full object-cover"
                          alt="Book Cover"
                        />
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex flex-col gap-1.5">
                        @for (t of (book.bookTranslations ?? []); track t.id) {
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
                      <div class="flex flex-wrap gap-1">
                        @for (catId of (book.category_ids ?? []); track catId) {
                          <span class="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded uppercase tracking-wider">
                            {{ getCategoryLabel(catId) }}
                          </span>
                        }
                        @empty {
                          <span class="text-xs text-slate-500 italic">Uncategorized</span>
                        }
                      </div>
                    </td>
                    <td class="px-6 py-4 text-sm text-slate-400">
                      {{ book.duration ? book.duration + ' min' : '—' }}
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full" [class]="book.status ? 'bg-emerald-400' : 'bg-slate-500'"></span>
                        <span class="text-sm text-slate-300">{{ book.status ? 'Active' : 'Inactive' }}</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <div class="flex justify-end gap-2">
                        <button [routerLink]="['/books/edit', book.id]" title="Edit book"
                          class="w-8 h-8 flex items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all">
                          <mat-icon class="!text-base">edit</mat-icon>
                        </button>
                        <button (click)="requestDelete(book.id, 'book', book.bookTranslations?.[0]?.title ?? 'Untitled')" title="Delete book"
                          class="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all">
                          <mat-icon class="!text-base">delete</mat-icon>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
                @empty {
                  <tr>
                    <td colspan="6" class="px-6 py-12 text-center text-slate-500 text-sm">No books found.</td>
                  </tr>
                }
              </tbody>
            </table>
            @if (booksTotal() > 0) {
              <div class="flex items-center justify-between px-6 py-4 border-t border-slate-800">
                <span class="text-xs text-slate-500">{{ booksTotal() }} books · Page {{ booksPage() }} of {{ booksTotalPages() }}</span>
                <div class="flex items-center gap-3">
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-slate-500">Per page</span>
                    <select
                      (change)="changeBooksLimit(+$any($event.target).value)"
                      class="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-300 outline-none focus:border-primary cursor-pointer">
                      @for (opt of pageSizeOptions; track opt) {
                        <option [value]="opt" [selected]="opt === booksLimit()">{{ opt }}</option>
                      }
                    </select>
                  </div>
                  <div class="flex items-center gap-2">
                    <button (click)="changeBooksPage(booksPage() - 1)" [disabled]="booksPage() === 1"
                      class="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold transition-all flex items-center gap-1">
                      <mat-icon class="!text-sm">chevron_left</mat-icon>Prev
                    </button>
                    <button (click)="changeBooksPage(booksPage() + 1)" [disabled]="booksPage() === booksTotalPages()"
                      class="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold transition-all flex items-center gap-1">
                      Next<mat-icon class="!text-sm">chevron_right</mat-icon>
                    </button>
                  </div>
                </div>
              </div>
            }
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
                  <th class="px-6 py-4">Books</th>
                  <th class="px-6 py-4">Status</th>
                  <th class="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800">
                @for (cat of categories(); track cat.id) {
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
                    <td class="px-6 py-4 text-sm text-slate-400">{{ cat._count?.bookCategories || 0 }}</td>
                    <td class="px-6 py-4">
                      <span class="px-2 py-1 text-[10px] font-bold rounded uppercase tracking-wider"
                        [class]="cat.status ? 'bg-emerald-400/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'">
                        {{ cat.status ? 'Active' : 'Inactive' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <div class="flex justify-end gap-2">
                        <button (click)="editCategory(cat)" title="Edit category"
                          class="w-8 h-8 flex items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all">
                          <mat-icon class="!text-base">edit</mat-icon>
                        </button>
                        <button (click)="requestDelete(cat.id, 'category', cat.categoryTranslations?.[0]?.name || 'Category')" title="Delete category"
                          class="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all">
                          <mat-icon class="!text-base">delete</mat-icon>
                        </button>
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
            @if (categoriesTotal() > 0) {
              <div class="flex items-center justify-between px-6 py-4 border-t border-slate-800">
                <span class="text-xs text-slate-500">{{ categoriesTotal() }} categories · Page {{ categoriesPage() }} of {{ categoriesTotalPages() }}</span>
                <div class="flex items-center gap-3">
                  <div class="flex items-center gap-2">
                    <span class="text-xs text-slate-500">Per page</span>
                    <select
                      (change)="changeCategoriesLimit(+$any($event.target).value)"
                      class="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-300 outline-none focus:border-primary cursor-pointer">
                      @for (opt of pageSizeOptions; track opt) {
                        <option [value]="opt" [selected]="opt === categoriesLimit()">{{ opt }}</option>
                      }
                    </select>
                  </div>
                  <div class="flex items-center gap-2">
                    <button (click)="changeCategoriesPage(categoriesPage() - 1)" [disabled]="categoriesPage() === 1"
                      class="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold transition-all flex items-center gap-1">
                      <mat-icon class="!text-sm">chevron_left</mat-icon>Prev
                    </button>
                    <button (click)="changeCategoriesPage(categoriesPage() + 1)" [disabled]="categoriesPage() === categoriesTotalPages()"
                      class="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold transition-all flex items-center gap-1">
                      Next<mat-icon class="!text-sm">chevron_right</mat-icon>
                    </button>
                  </div>
                </div>
              </div>
            }
            }
          }
        </div>
      </div>
    </div>

    <!-- Category Modal -->
    @if (showCategoryModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <div class="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden">
          <div class="p-6 border-b border-slate-800 flex justify-between items-center">
            <div>
              <h2 class="text-xl font-bold">{{ editingCategory() ? 'Edit Category' : 'Create New Category' }}</h2>
              <p class="text-xs text-slate-500 mt-1">Add a new content section to your library</p>
            </div>
            <button (click)="closeCategoryModal()" class="text-slate-500 hover:text-white transition-colors">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <div class="p-8 space-y-6">
            @if (categoryError()) {
              <div class="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">{{ categoryError() }}</div>
            }

            <!-- Translation tabs -->
            <div class="bg-slate-950/30 border border-slate-800 rounded-2xl overflow-hidden">
              <div class="flex items-center gap-1 border-b border-slate-800 px-4 overflow-x-auto">
                @for (tCtrl of categoryTranslations.controls; track $index; let ti = $index) {
                  <button type="button" (click)="categoryActiveTab.set(ti)"
                    class="flex items-center gap-1.5 px-4 py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap flex-shrink-0"
                    [class.text-primary]="categoryActiveTab() === ti"
                    [class.border-primary]="categoryActiveTab() === ti"
                    [class.border-transparent]="categoryActiveTab() !== ti"
                    [class.text-slate-400]="categoryActiveTab() !== ti">
                    <mat-icon class="!text-base">translate</mat-icon>
                    {{ getCategoryTabLabel(ti) }}
                    @if (categoryTranslations.length > 1) {
                      <span (click)="$event.stopPropagation(); removeCategoryTranslation(ti)"
                        class="w-4 h-4 flex items-center justify-center rounded-full text-slate-500 hover:bg-rose-500 hover:text-white transition-colors text-xs leading-none ml-1">✕</span>
                    }
                  </button>
                }
                <button type="button" (click)="addCategoryTranslation()"
                  class="ml-2 flex-shrink-0 flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/10 rounded-lg transition-colors my-2">
                  <mat-icon class="!text-sm">add</mat-icon>
                  Add Language
                </button>
              </div>

              <form [formGroup]="categoryTranslationsForm">
                <div formArrayName="translations">
                  @for (tCtrl of categoryTranslations.controls; track $index; let ti = $index) {
                    <div [formGroupName]="ti" [hidden]="categoryActiveTab() !== ti" class="p-6">
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="space-y-2">
                          <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Language *</label>
                          <select formControlName="language_id" class="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all">
                            <option value="">Select Language</option>
                            @for (lang of availableCategoryLanguages(ti); track lang.id) {
                              <option [value]="lang.id">{{ lang.name }}</option>
                            }
                          </select>
                        </div>
                        <div class="space-y-2">
                          <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Name *</label>
                          <input formControlName="name" class="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="e.g. Science Fiction">
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </form>
            </div>

            <!-- Status -->
            <div class="flex items-center justify-between p-4 bg-slate-950/30 border border-slate-800 rounded-2xl">
              <div>
                <p class="text-sm font-bold">Status</p>
                <p class="text-xs text-slate-500 mt-0.5">{{ categoryStatus() ? 'Active — visible to users' : 'Inactive — hidden from users' }}</p>
              </div>
              <button type="button" (click)="categoryStatus.update(v => !v)"
                class="relative w-12 h-6 rounded-full transition-colors flex-shrink-0"
                [class]="categoryStatus() ? 'bg-primary' : 'bg-slate-700'">
                <span class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                  [class.translate-x-6]="categoryStatus()"></span>
              </button>
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
              <button (click)="saveCategory()" [disabled]="categoryTranslationsForm.invalid || isSavingCategory()" class="px-8 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all">
                {{ isSavingCategory() ? 'Saving...' : 'Save Category' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Delete Confirmation Modal -->
    @if (showDeleteModal()) {
      <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
        <div class="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
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
            @if (deleteError()) {
              <div class="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">{{ deleteError() }}</div>
            }
            <div class="flex flex-col gap-3 pt-4">
              <button (click)="confirmDelete()" [disabled]="isDeleting()"
                class="w-full py-3.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-lg shadow-rose-500/20 transition-all flex items-center justify-center gap-2">
                <mat-icon class="!text-lg">{{ isDeleting() ? 'autorenew' : 'delete' }}</mat-icon>
                {{ isDeleting() ? 'Deleting...' : 'Delete Permanently' }}
              </button>
              <button (click)="closeDeleteModal()" [disabled]="isDeleting()"
                class="w-full py-3.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 font-bold rounded-2xl transition-all">
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
export class BooksManagementComponent implements OnInit {
  data = inject(DataService);
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  activeTab = signal('books');
  showCategoryModal = signal(false);
  editingCategory = signal<Category | null>(null);
  languages = signal<Language[]>([]);
  isSavingCategory = signal(false);
  categoryError = signal<string | null>(null);
  categoryPhotoPreview = signal<string | null>(null);
  categoryStatus = signal(true);
  private categoryPhotoFile: File | null = null;

  readonly pageSizeOptions = [10, 20, 50, 100];

  // --- Books reactive loading ---
  booksNameInput = signal('');
  booksLanguageId = signal<number | null>(null);
  booksCategoryId = signal<number | null>(null);
  private _booksNameD = toSignal(
    toObservable(this.booksNameInput).pipe(debounceTime(350)),
    { initialValue: '' }
  );
  private _resetBooksPage = effect(() => {
    this._booksNameD(); this.booksLanguageId(); this.booksCategoryId();
    this.booksPage.set(1);
  }, { allowSignalWrites: true });

  booksPage = signal(1);
  booksLimit = signal(10);
  private _bookRefresh = signal(0);
  private _bookParams = computed(() => ({
    page: this.booksPage(), limit: this.booksLimit(), _r: this._bookRefresh(),
    name: this._booksNameD() || undefined,
    languageId: this.booksLanguageId() ?? undefined,
    categoryId: this.booksCategoryId() ?? undefined,
  }));
  private _bookRaw = toSignal(
    toObservable(this._bookParams).pipe(
      switchMap(({ page, limit, name, languageId, categoryId }) =>
        this.api.getAllBooks(page, limit, { name, languageId, categoryId }).pipe(
          catchError(() => of({ data: [] as unknown[], pagination: { total: 0, page: 1, limit, totalPages: 0 } }))
        )
      )
    )
  );
  isLoadingBooks = computed(() => this._bookRaw() === undefined);
  booksTotal = computed(() => this._bookRaw()?.pagination.total ?? 0);
  booksTotalPages = computed(() => this._bookRaw()?.pagination.totalPages ?? 1);
  private _syncBooks = effect(() => {
    const res = this._bookRaw();
    if (!res) return;
    const mapped: Book[] = (res.data as any[]).map((book: any) => {
      const translations: BookTranslation[] = (book.bookTranslations ?? []).map((t: any) => ({
        id: t.id, title: t.title, description: t.description,
        language: t.language, bookPages: t.bookPages ?? [],
      }));
      const categoryIds: number[] = (book.bookCategories ?? []).map((bc: any) => bc.category?.id ?? bc.category_id);
      return {
        id: book.id,
        photo_url: book.photo_url,
        duration: book.duration,
        status: book.status,
        category_ids: categoryIds.filter(Boolean),
        bookTranslations: translations,
      } as Book;
    });
    this.data.books.set(mapped);
  }, { allowSignalWrites: true });

  // --- Categories reactive loading ---
  categoriesNameInput = signal('');
  categoriesLanguageId = signal<number | null>(null);
  private _categoriesNameD = toSignal(
    toObservable(this.categoriesNameInput).pipe(debounceTime(350)),
    { initialValue: '' }
  );
  private _resetCatPage = effect(() => {
    this._categoriesNameD(); this.categoriesLanguageId();
    this.categoriesPage.set(1);
  }, { allowSignalWrites: true });

  categoriesPage = signal(1);
  categoriesLimit = signal(10);
  private _catRefresh = signal(0);
  private _catParams = computed(() => ({
    page: this.categoriesPage(), limit: this.categoriesLimit(), _r: this._catRefresh(),
    name: this._categoriesNameD() || undefined,
    languageId: this.categoriesLanguageId() ?? undefined,
  }));
  private _catResponse = toSignal(
    toObservable(this._catParams).pipe(
      switchMap(({ page, limit, name, languageId }) =>
        this.api.getCategories(page, limit, { name, languageId }).pipe(
          catchError(() => of({ data: [] as Category[], pagination: { total: 0, page: 1, limit, totalPages: 0 } }))
        )
      )
    )
  );
  isLoadingCategories = computed(() => this._catResponse() === undefined);
  categoriesTotal = computed(() => this._catResponse()?.pagination.total ?? 0);
  categoriesTotalPages = computed(() => this._catResponse()?.pagination.totalPages ?? 1);
  categories = computed(() => this._catResponse()?.data ?? []);
  private _syncCats = effect(() => {
    const res = this._catResponse();
    if (res) this.data.categories.set(res.data);
  }, { allowSignalWrites: true });

  categoriesLookup = signal<Category[]>([]);

  // Delete Modal State
  showDeleteModal = signal(false);
  itemToDelete = signal<{ id: string, type: 'book' | 'category', name: string } | null>(null);
  isDeleting = signal(false);
  deleteError = signal<string | null>(null);

  categoryActiveTab = signal(0);
  categoryTranslationsForm = this.fb.group({ translations: this.fb.array([]) });

  get categoryTranslations(): FormArray {
    return this.categoryTranslationsForm.get('translations') as FormArray;
  }

  private newCategoryTranslationGroup(langId = '', name = '') {
    return this.fb.group({
      language_id: [langId, Validators.required],
      name: [name, Validators.required],
    });
  }

  getCategoryTabLabel(tIdx: number): string {
    const langId = this.categoryTranslations.at(tIdx)?.get('language_id')?.value;
    if (!langId) return `Language ${tIdx + 1}`;
    return this.languages().find(l => String(l.id) === String(langId))?.name ?? `Language ${tIdx + 1}`;
  }

  availableCategoryLanguages(tIdx: number): Language[] {
    const taken = this.categoryTranslations.controls
      .map((ctrl, i) => i !== tIdx ? String(ctrl.get('language_id')?.value) : null)
      .filter(Boolean);
    return this.languages().filter(l => !taken.includes(String(l.id)));
  }

  addCategoryTranslation() {
    this.categoryTranslations.push(this.newCategoryTranslationGroup());
    this.categoryActiveTab.set(this.categoryTranslations.length - 1);
  }

  removeCategoryTranslation(tIdx: number) {
    if (this.categoryTranslations.length === 1) return;
    this.categoryTranslations.removeAt(tIdx);
    this.categoryActiveTab.set(Math.min(this.categoryActiveTab(), this.categoryTranslations.length - 1));
  }

  ngOnInit() {
    this.api.getLanguages().subscribe(langs => this.languages.set(langs));
    this.api.getCategories(1, 100).subscribe(res => this.categoriesLookup.set(res.data));
    const tab = this.route.snapshot.queryParamMap.get('tab');
    if (tab) this.activeTab.set(tab);
  }

  changeBooksPage(page: number) {
    if (page < 1 || page > this.booksTotalPages()) return;
    this.booksPage.set(page);
  }

  changeBooksLimit(limit: number) {
    this.booksLimit.set(limit);
    this.booksPage.set(1);
  }

  changeCategoriesPage(page: number) {
    if (page < 1 || page > this.categoriesTotalPages()) return;
    this.categoriesPage.set(page);
  }

  changeCategoriesLimit(limit: number) {
    this.categoriesLimit.set(limit);
    this.categoriesPage.set(1);
  }

  getCategoryLabel(categoryId?: number): string {
    if (!categoryId) return 'Uncategorized';
    const cat = this.categoriesLookup().find(c => c.id === categoryId);
    return cat ? this.getCategoryName(cat) : String(categoryId);
  }

  getCategoryName(cat: Category): string {
    return cat.categoryTranslations?.find(t => t.language.id === 1)?.name ||
           cat.categoryTranslations?.[0]?.name || 'Unnamed Category';
  }

  openCategoryModal() {
    this.editingCategory.set(null);
    while (this.categoryTranslations.length) this.categoryTranslations.removeAt(0);
    this.categoryTranslations.push(this.newCategoryTranslationGroup());
    this.categoryActiveTab.set(0);
    this.categoryPhotoFile = null;
    this.categoryPhotoPreview.set(null);
    this.categoryStatus.set(true);
    this.categoryError.set(null);
    this.showCategoryModal.set(true);
  }

  editCategory(cat: Category) {
    this.editingCategory.set(cat);
    while (this.categoryTranslations.length) this.categoryTranslations.removeAt(0);
    const translations = cat.categoryTranslations ?? [];
    if (translations.length === 0) {
      this.categoryTranslations.push(this.newCategoryTranslationGroup());
    } else {
      translations.forEach(t => {
        this.categoryTranslations.push(this.newCategoryTranslationGroup(String(t.language.id), t.name));
      });
    }
    this.categoryActiveTab.set(0);
    this.categoryPhotoFile = null;
    this.categoryPhotoPreview.set(cat.photo_url || null);
    this.categoryStatus.set(cat.status ?? true);
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
    if (this.categoryTranslationsForm.invalid || this.isSavingCategory()) return;
    const editing = this.editingCategory();

    if (!editing && !this.categoryPhotoFile) {
      this.categoryError.set('A cover image is required.');
      return;
    }

    this.isSavingCategory.set(true);
    this.categoryError.set(null);

    const count = this.categoryTranslations.length;

    const buildFormData = (tIdx: number, isFirst: boolean): FormData => {
      const t = this.categoryTranslations.at(tIdx).value;
      const fd = new FormData();
      fd.append('language_id', t.language_id);
      fd.append('name', t.name);
      if (isFirst) {
        fd.append('status', String(this.categoryStatus()));
        if (this.categoryPhotoFile) fd.append('photo', this.categoryPhotoFile);
      }
      return fd;
    };

    if (editing) {
      const requests$ = Array.from({ length: count }, (_, i) =>
        this.api.updateCategory(editing.id, buildFormData(i, i === 0))
      );
      concat(...requests$).pipe(toArray()).subscribe({
        next: (results) => {
          const last = results[results.length - 1] as Category;
          this.data.updateCategory(last);
          this.categoriesLookup.update(cats => cats.map(c => c.id === last.id ? last : c));
          this._catRefresh.update(n => n + 1);
          this.isSavingCategory.set(false);
          this.closeCategoryModal();
        },
        error: (err) => {
          this.categoryError.set(err.error?.error || 'Failed to save category.');
          this.isSavingCategory.set(false);
        }
      });
    } else {
      this.api.createCategory(buildFormData(0, true)).pipe(
        switchMap((result) => {
          const categoryId = (result as any).id;
          if (count === 1) return of(result);
          const rest$ = Array.from({ length: count - 1 }, (_, i) =>
            this.api.updateCategory(categoryId, buildFormData(i + 1, false))
          );
          return concat(...rest$).pipe(toArray(), map(() => result));
        })
      ).subscribe({
        next: (saved) => {
          const category = saved as Category;
          this.categoriesLookup.update(cats => [...cats, category]);
          this._catRefresh.update(n => n + 1);
          this.isSavingCategory.set(false);
          this.closeCategoryModal();
        },
        error: (err) => {
          this.categoryError.set(err.error?.error || 'Failed to create category.');
          this.isSavingCategory.set(false);
        }
      });
    }
  }

  requestDelete(id: number, type: 'book' | 'category', name: string) {
    this.itemToDelete.set({ id: id.toString(), type, name });
    this.deleteError.set(null);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.itemToDelete.set(null);
    this.deleteError.set(null);
  }

  confirmDelete() {
    const item = this.itemToDelete();
    if (!item || this.isDeleting()) return;

    const id = parseInt(item.id);
    this.isDeleting.set(true);
    this.deleteError.set(null);

    const request$ = item.type === 'book'
      ? this.api.deleteBook(id)
      : this.api.deleteCategory(id);

    request$.subscribe({
      next: () => {
        if (item.type === 'book') {
          const prevPage = this.data.books().length === 1 && this.booksPage() > 1
            ? this.booksPage() - 1 : this.booksPage();
          if (prevPage !== this.booksPage()) this.booksPage.set(prevPage);
          else this._bookRefresh.update(n => n + 1);
        } else if (item.type === 'category') {
          this.categoriesLookup.update(cats => cats.filter(c => c.id !== id));
          const prevPage = this.categories().length === 1 && this.categoriesPage() > 1
            ? this.categoriesPage() - 1 : this.categoriesPage();
          if (prevPage !== this.categoriesPage()) this.categoriesPage.set(prevPage);
          else this._catRefresh.update(n => n + 1);
        }
        this.isDeleting.set(false);
        this.closeDeleteModal();
      },
      error: (err) => {
        const msg = err.error?.error || `Failed to delete ${item.type}.`;
        const details = err.error?.details;
        this.deleteError.set(details
          ? `${msg} It is used by ${details.books ?? 0} book(s) and ${details.profiles ?? 0} profile(s).`
          : msg);
        this.isDeleting.set(false);
      }
    });
  }
}
