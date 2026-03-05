import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { DataService } from '../data.service';
import { Series } from '../models';

@Component({
  selector: 'app-create-series',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, RouterLink],
  template: `
    <div class="max-w-[1400px] mx-auto space-y-6 pb-20">
      <!-- Header -->
      <div class="flex justify-between items-center bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
        <div class="flex items-center gap-4">
          <button routerLink="/stories" class="w-10 h-10 rounded-xl border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div>
            <h1 class="text-xl font-bold tracking-tight">{{ isEdit ? 'Edit Story Series' : 'Create Story Series' }}</h1>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <button routerLink="/stories" class="text-sm font-bold text-slate-400 hover:text-white transition-colors">Discard Draft</button>
          <button (click)="submit()" class="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
            <mat-icon class="!text-lg">save</mat-icon>
            {{ isEdit ? 'Update Series' : 'Save Series' }}
          </button>
        </div>
      </div>

      <form [formGroup]="seriesForm" class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Left Column (8 cols) -->
        <div class="lg:col-span-8 space-y-6">
          <!-- Series Details -->
          <section class="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 space-y-8">
            <div class="flex items-center gap-3 text-primary">
              <mat-icon>translate</mat-icon>
              <h3 class="font-bold uppercase tracking-widest text-xs">Series Details</h3>
              <span class="ml-auto text-[10px] text-slate-500 font-bold uppercase tracking-widest">Mandatory Translations</span>
            </div>

              <div class="space-y-6">
              <div class="space-y-4">
                <label for="title_en" class="text-sm font-bold text-slate-300">Series Title</label>
                <div class="space-y-3">
                  <div class="relative">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">EN</span>
                    <input id="title_en" formControlName="title_en" class="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 pl-14 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="The Chronicles of Elowen">
                  </div>
                  <div class="relative">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">ES</span>
                    <input formControlName="title_es" class="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 pl-14 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Spanish Title (Mandatory)">
                  </div>
                  <div class="relative">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">FR</span>
                    <input formControlName="title_fr" class="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 pl-14 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="French Title (Mandatory)">
                  </div>
                </div>
              </div>

              <div class="space-y-4">
                <label for="desc_en" class="text-sm font-bold text-slate-300">Series Description</label>
                <div class="space-y-3">
                  <div class="relative">
                    <span class="absolute left-4 top-4 text-[10px] font-bold text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">EN</span>
                    <textarea id="desc_en" formControlName="desc_en" rows="3" class="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 pl-14 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="English Description"></textarea>
                  </div>
                  <div class="relative">
                    <span class="absolute left-4 top-4 text-[10px] font-bold text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">ES</span>
                    <textarea formControlName="desc_es" rows="3" class="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 pl-14 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Spanish Description (Mandatory)"></textarea>
                  </div>
                  <div class="relative">
                    <span class="absolute left-4 top-4 text-[10px] font-bold text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">FR</span>
                    <textarea formControlName="desc_fr" rows="3" class="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 pl-14 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="French Description (Mandatory)"></textarea>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Add Stories to Series -->
          <section class="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 space-y-6">
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-3 text-primary">
                <mat-icon>format_list_bulleted</mat-icon>
                <h3 class="font-bold uppercase tracking-widest text-xs">Add Stories to Series</h3>
              </div>
              <span class="text-[10px] font-bold text-primary uppercase tracking-widest">{{ selectedStoryIds().length }} selected</span>
            </div>

            <div class="relative group">
              <mat-icon class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">search</mat-icon>
              <input 
                type="text" 
                placeholder="Search your library for stories..." 
                class="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                (input)="searchQuery.set($any($event.target).value)"
              />
            </div>

            <div class="space-y-3">
              @for (story of filteredStories(); track story.id) {
                <div class="flex items-center gap-4 p-4 bg-slate-950/30 border border-slate-800 rounded-2xl group transition-all" [class.border-primary/50]="isStorySelected(story.id)">
                  <div class="w-14 h-14 rounded-xl bg-slate-800 overflow-hidden flex-shrink-0">
                    <img src="https://picsum.photos/seed/{{story.id}}/100/100" class="w-full h-full object-cover" referrerpolicy="no-referrer" alt="Story Cover" />
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-bold">{{ story.title }}</p>
                    <p class="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">Last edited 2 days ago</p>
                  </div>
                  @if (isStorySelected(story.id)) {
                    <div class="flex items-center gap-3">
                      <div class="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white">
                        <mat-icon class="!text-sm">check</mat-icon>
                      </div>
                      <mat-icon class="text-slate-600 cursor-move opacity-0 group-hover:opacity-100 transition-opacity">drag_indicator</mat-icon>
                    </div>
                  } @else {
                    <button (click)="toggleStory(story.id)" type="button" class="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all">
                      Add
                    </button>
                  }
                </div>
              }
            </div>
          </section>
        </div>

        <!-- Right Column (4 cols) -->
        <div class="lg:col-span-4 space-y-6">
          <!-- Cover Image -->
          <section class="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 space-y-6">
            <div class="flex items-center gap-3 text-primary">
              <mat-icon>image</mat-icon>
              <h3 class="font-bold uppercase tracking-widest text-xs">Cover Image</h3>
            </div>
            <div class="aspect-[3/4] bg-slate-950/50 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-slate-800/30 transition-all group p-6 text-center">
              <div class="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors shadow-lg">
                <mat-icon class="!text-3xl">add_photo_alternate</mat-icon>
              </div>
              <div>
                <p class="text-sm font-bold">Click or drag to upload</p>
                <p class="text-[10px] text-slate-500 mt-2 leading-relaxed">Recommended: 1200 x 1600 px (3:4 ratio). PNG, JPG up to 5MB.</p>
              </div>
              <button type="button" class="mt-2 px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold transition-all">Select File</button>
            </div>
          </section>

          <!-- Publishing Settings -->
          <section class="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 space-y-8">
            <div class="flex items-center gap-3 text-primary">
              <mat-icon>settings</mat-icon>
              <h3 class="font-bold uppercase tracking-widest text-xs">Publishing Settings</h3>
            </div>

            <div class="space-y-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-bold">Visibility</p>
                  <p class="text-[10px] text-slate-500">Public or Private series</p>
                </div>
                <select formControlName="visibility" class="bg-slate-800 border-none rounded-lg text-xs font-bold py-1.5 px-3 text-primary outline-none cursor-pointer">
                  <option value="Public">Public</option>
                  <option value="Private">Private</option>
                </select>
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-bold">Content Rating</p>
                  <p class="text-[10px] text-slate-500">Age appropriateness</p>
                </div>
                <select formControlName="rating" class="bg-slate-800 border-none rounded-lg text-xs font-bold py-1.5 px-3 text-primary outline-none cursor-pointer">
                  <option value="Everyone">Everyone</option>
                  <option value="13+">13+ Teens</option>
                  <option value="18+">18+ Adults</option>
                </select>
              </div>

              <div class="space-y-4 pt-2">
                <div class="flex items-center justify-between">
                  <p class="text-sm font-bold">Enable comments on series page</p>
                  <div class="w-10 h-5 bg-primary rounded-full relative cursor-pointer">
                    <div class="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
                <div class="flex items-center justify-between opacity-50">
                  <p class="text-sm font-bold">Auto-notify followers on new chapters</p>
                  <div class="w-10 h-5 bg-slate-700 rounded-full relative cursor-pointer">
                    <div class="absolute left-1 top-1 w-3 h-3 bg-slate-400 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Help Box -->
          <div class="bg-primary/10 border border-primary/20 rounded-2xl p-8 space-y-4 relative overflow-hidden">
            <div class="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl"></div>
            <div class="flex items-center gap-3 text-primary">
              <mat-icon>lightbulb</mat-icon>
              <h3 class="font-bold">Need help?</h3>
            </div>
            <p class="text-sm text-slate-300 leading-relaxed">
              Series help you organize your storytelling by grouping chapters or related arcs together.
            </p>
            <button class="text-xs font-bold text-primary flex items-center gap-2 hover:underline">
              Read Guide
              <mat-icon class="!text-sm">open_in_new</mat-icon>
            </button>
          </div>
        </div>
      </form>
    </div>
  `,
  styles: [`
    :host { display: block; }
    textarea { resize: none; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateSeriesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  data = inject(DataService);

  isEdit = false;
  seriesId: number | null = null;
  searchQuery = signal('');
  selectedStoryIds = signal<number[]>([]);

  seriesForm = this.fb.group({
    title_en: ['', Validators.required],
    title_es: ['', Validators.required],
    title_fr: ['', Validators.required],
    desc_en: ['', Validators.required],
    desc_es: ['', Validators.required],
    desc_fr: ['', Validators.required],
    visibility: ['Public'],
    rating: ['Everyone']
  });

  filteredStories = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.data.stories().filter(s => 
      s.title.toLowerCase().includes(query)
    );
  });

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.seriesId = parseInt(idParam);
      this.isEdit = true;
      const series = this.data.getSeriesById(this.seriesId);
      if (series) {
        this.seriesForm.patchValue({
          title_en: series.titles['en'],
          title_es: series.titles['es'],
          title_fr: series.titles['fr'] || '',
          desc_en: series.descriptions?.['en'] || '',
          desc_es: series.descriptions?.['es'] || '',
          desc_fr: series.descriptions?.['fr'] || '',
          visibility: series.status,
          rating: series.contentRating
        });
        this.selectedStoryIds.set([...series.stories]);
      }
    }
  }

  isStorySelected(id: number) {
    return this.selectedStoryIds().includes(id);
  }

  toggleStory(id: number) {
    this.selectedStoryIds.update(ids => 
      ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]
    );
  }

  submit() {
    if (this.seriesForm.valid) {
      const formValue = this.seriesForm.value;
      const seriesData: unknown = {
        id: 0,
        titles: {
          en: formValue.title_en || '',
          es: formValue.title_es || '',
          fr: formValue.title_fr || ''
        },
        descriptions: {
          en: formValue.desc_en || '',
          es: formValue.desc_es || '',
          fr: formValue.desc_fr || ''
        },
        status: (formValue.visibility as 'Public' | 'Private') || 'Public',
        contentRating: formValue.rating || 'Everyone',
        stories: this.selectedStoryIds()
      };

      if (this.isEdit && this.seriesId) {
        this.data.updateSeries({ ...(seriesData as Series), id: this.seriesId });
      } else {
        this.data.addSeries({
          ...(seriesData as Series),
          id: Math.floor(Math.random() * 1000)
        });
      }
      this.router.navigate(['/stories']);
    }
  }
}
