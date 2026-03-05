import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { DataService } from '../data.service';

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
            <h1 class="text-3xl font-bold tracking-tight">{{ isEdit ? 'Edit Story' : 'Create New Story' }}</h1>
            <p class="text-slate-400 mt-1">{{ isEdit ? 'Update your story details and content.' : 'Fill in the details below to publish a new story.' }}</p>
          </div>
        </div>
        <div class="flex gap-3">
          <button class="px-6 py-2.5 border border-slate-800 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
            Save Draft
          </button>
          <button (click)="submit()" class="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all">
            {{ isEdit ? 'Update Story' : 'Publish Story' }}
          </button>
        </div>
      </div>

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
              <!-- Multi-language Title -->
              <div class="space-y-4">
                <label for="title_en" class="text-sm font-bold text-slate-400 uppercase tracking-wider">Story Title</label>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <label for="title_en" class="text-xs font-bold text-slate-500">English</label>
                    <input id="title_en" formControlName="title_en" class="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Enter title in English">
                  </div>
                  <div class="space-y-2">
                    <label for="title_es" class="text-xs font-bold text-slate-500">Spanish</label>
                    <input id="title_es" formControlName="title_es" class="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Enter title in Spanish">
                  </div>
                </div>
              </div>

              <!-- Multi-language Description -->
              <div class="space-y-4">
                <label for="desc_en" class="text-sm font-bold text-slate-400 uppercase tracking-wider">Description</label>
                <div class="space-y-4">
                  <div class="space-y-2">
                    <label for="desc_en" class="text-xs font-bold text-slate-500">English</label>
                    <textarea id="desc_en" formControlName="desc_en" rows="3" class="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Enter description in English"></textarea>
                  </div>
                  <div class="space-y-2">
                    <label for="desc_es" class="text-xs font-bold text-slate-500">Spanish</label>
                    <textarea id="desc_es" formControlName="desc_es" rows="3" class="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Enter description in Spanish"></textarea>
                  </div>
                </div>
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
                  <button (click)="removePage(i)" class="absolute -top-3 -right-3 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all">
                    <mat-icon class="!text-sm">close</mat-icon>
                  </button>
                  
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <!-- Page Image -->
                    <div class="space-y-2">
                      <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Page {{i + 1}} Image</span>
                      <div class="aspect-square bg-slate-900 rounded-xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-800/50 transition-all">
                        <mat-icon class="text-slate-600">add_a_photo</mat-icon>
                        <span class="text-[10px] font-bold text-slate-500">Upload Image</span>
                      </div>
                    </div>

                    <!-- Page Text -->
                    <div class="md:col-span-2 space-y-4">
                      <div class="space-y-2">
                        <span class="text-xs font-bold text-slate-500">English Text</span>
                        <textarea formControlName="text_en" rows="3" class="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Enter page text in English"></textarea>
                      </div>
                      <div class="space-y-2">
                        <span class="text-xs font-bold text-slate-500">Spanish Text</span>
                        <textarea formControlName="text_es" rows="3" class="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Enter page text in Spanish"></textarea>
                      </div>
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
            <div class="aspect-[3/4] bg-slate-900 rounded-xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-slate-800/50 transition-all group">
              <div class="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
                <mat-icon>image</mat-icon>
              </div>
              <div class="text-center">
                <p class="text-xs font-bold">Click to upload cover</p>
                <p class="text-[10px] text-slate-500 mt-1">Recommended: 1200x1600px</p>
              </div>
            </div>
          </section>

          <!-- Settings -->
          <section class="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h3 class="font-bold">Story Settings</h3>
            
            <div class="space-y-4">
              <div class="space-y-2">
                <label for="category" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
                <select id="category" formControlName="category" class="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all">
                  <option value="">Select Category</option>
                  @for (cat of data.categories(); track cat.id) {
                    <option [value]="cat.id">{{ getCategoryName(cat) }}</option>
                  }
                </select>
              </div>

              <div class="space-y-2">
                <label for="author" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Author</label>
                <input id="author" formControlName="author" class="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Author name">
              </div>

              <div class="space-y-2">
                <label for="rating" class="text-xs font-bold text-slate-500 uppercase tracking-wider">Content Rating</label>
                <div class="grid grid-cols-2 gap-2">
                  <button id="rating" type="button" class="py-2 px-3 rounded-lg border border-slate-800 text-[10px] font-bold uppercase tracking-wider hover:bg-slate-800 transition-all" [class.bg-primary]="storyForm.get('rating')?.value === 'all'" (click)="storyForm.get('rating')?.setValue('all')">All Ages</button>
                  <button type="button" class="py-2 px-3 rounded-lg border border-slate-800 text-[10px] font-bold uppercase tracking-wider hover:bg-slate-800 transition-all" [class.bg-primary]="storyForm.get('rating')?.value === '13+'" (click)="storyForm.get('rating')?.setValue('13+')">13+ Teens</button>
                </div>
              </div>

              <div class="flex items-center justify-between p-3 bg-slate-950/30 rounded-xl border border-slate-800">
                <div class="space-y-0.5">
                  <p class="text-xs font-bold">Featured Story</p>
                  <p class="text-[10px] text-slate-500">Show on homepage</p>
                </div>
                <input type="checkbox" formControlName="isFeatured" class="w-5 h-5 rounded border-slate-800 bg-transparent text-primary focus:ring-primary">
              </div>
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
  data = inject(DataService);

  isEdit = false;
  storyId: number | null = null;

  storyForm = this.fb.group({
    title_en: ['', Validators.required],
    title_es: [''],
    desc_en: ['', Validators.required],
    desc_es: [''],
    category: ['', Validators.required],
    author: ['System', Validators.required],
    rating: ['all'],
    isFeatured: [false],
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
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.storyId = parseInt(idParam);
      this.isEdit = true;
      const story = this.data.getStoryById(this.storyId);
      if (story) {
        this.storyForm.patchValue({
          title_en: story.title,
          category: story.category_ids?.[0]?.toString() || '',
          author: 'System',
        });
        // Mocking pages for edit if they don't exist in model yet
        if (story.storyPages && (story.storyPages as { text_content: string }[]).length > 0) {
          (story.storyPages as { text_content: string }[]).forEach(p => {
            this.pages.push(this.fb.group({
              image: [''],
              text_en: [p.text_content, Validators.required],
              text_es: ['']
            }));
          });
        } else {
          this.addPage();
        }
      }
    } else {
      this.addPage(); // Start with one page for new story
    }
  }

  addPage() {
    const pageGroup = this.fb.group({
      image: [''],
      text_en: ['', Validators.required],
      text_es: ['']
    });
    this.pages.push(pageGroup);
  }

  removePage(index: number) {
    this.pages.removeAt(index);
  }

  submit() {
    if (this.storyForm.valid) {
      const formValue = this.storyForm.value;
      if (this.isEdit && this.storyId) {
        const existing = this.data.getStoryById(this.storyId);
        if (existing) {
          this.data.updateStory({
            ...existing,
            title: formValue.title_en!,
            category_ids: [parseInt(formValue.category!)],
          });
        }
      } else {
        this.data.addStory({
          id: Math.floor(Math.random() * 1000),
          title: formValue.title_en!,
          category_ids: [parseInt(formValue.category!)],
          photo_url: 'https://picsum.photos/seed/new/100/100',
        });
      }
      this.router.navigate(['/stories']);
    }
  }
}
