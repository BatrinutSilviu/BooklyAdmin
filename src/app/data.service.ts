import { Injectable, signal, inject } from '@angular/core';
import { User, Story, Category, Series } from './models';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private api = inject(ApiService);

  users = signal<User[]>([
    { id: '123e4567-e89b-12d3-a456-426614174000', email: 'john@example.com', created_at: '2023-10-24T10:00:00Z' },
  ]);

  stories = signal<Story[]>([
    { id: 1, title: 'The Future of AI in Design', photo_url: 'https://picsum.photos/seed/1/100/100', category_ids: [1] },
    { id: 2, title: 'Minimalist Living: A Guide', photo_url: 'https://picsum.photos/seed/2/100/100', category_ids: [2] },
  ]);

  categories = signal<Category[]>([
    { 
      id: 1, 
      created_at: '2023-10-24T10:00:00Z', 
      categoryTranslations: [
        { id: 1, name: 'Technology', language: { id: 1, name: 'English', country_code: 'US' } },
        { id: 2, name: 'Tecnología', language: { id: 2, name: 'Spanish', country_code: 'ES' } }
      ] 
    },
    { 
      id: 2, 
      created_at: '2023-10-24T10:00:00Z', 
      categoryTranslations: [
        { id: 3, name: 'Lifestyle', language: { id: 1, name: 'English', country_code: 'US' } }
      ] 
    },
  ]);

  series = signal<Series[]>([
    { id: 1, titles: { en: 'The Chronicles of Elowen' }, stories: [1], status: 'Public', contentRating: 'Everyone' },
  ]);

  // Helper to simulate API calls
  async getUsers(): Promise<User[]> {
    return this.users();
  }

  async getStories(): Promise<Story[]> {
    return this.stories();
  }

  getStoryById(id: number) {
    return this.stories().find(s => s.id === id);
  }

  getSeriesById(id: number) {
    return this.series().find(s => s.id === id);
  }

  getCategoryById(id: number) {
    return this.categories().find(c => c.id === id);
  }

  updateStory(updatedStory: Story) {
    this.stories.update(stories => stories.map(s => s.id === updatedStory.id ? updatedStory : s));
  }

  updateSeries(updatedSeries: Series) {
    this.series.update(series => series.map(s => s.id === updatedSeries.id ? updatedSeries : s));
  }

  updateCategory(updatedCategory: Category) {
    this.categories.update(categories => categories.map(c => c.id === updatedCategory.id ? updatedCategory : c));
  }

  addCategory(category: Category) {
    this.categories.update(categories => [...categories, category]);
  }

  addSeries(series: Series) {
    this.series.update(s => [...s, series]);
  }

  addStory(story: Story) {
    this.stories.update(s => [...s, story]);
  }

  deleteStory(id: number) {
    this.stories.update(stories => stories.filter(s => s.id !== id));
  }

  deleteCategory(id: number) {
    this.categories.update(categories => categories.filter(c => c.id !== id));
  }

  deleteSeries(id: number) {
    this.series.update(series => series.filter(s => s.id !== id));
  }
}
