import { Injectable, signal, inject } from '@angular/core';
import { User, Book, Category } from './models';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private api = inject(ApiService);

  users = signal<User[]>([]);

  books = signal<Book[]>([]);

  categories = signal<Category[]>([]);

  async getUsers(): Promise<User[]> {
    return this.users();
  }

  async getBooks(): Promise<Book[]> {
    return this.books();
  }

  getBookById(id: number) {
    return this.books().find(b => b.id === id);
  }

  getCategoryById(id: number) {
    return this.categories().find(c => c.id === id);
  }

  updateBook(updatedBook: Book) {
    this.books.update(books => books.map(b => b.id === updatedBook.id ? updatedBook : b));
  }

  updateCategory(updatedCategory: Category) {
    this.categories.update(categories => categories.map(c => c.id === updatedCategory.id ? updatedCategory : c));
  }

  addCategory(category: Category) {
    this.categories.update(categories => [...categories, category]);
  }

  addBook(book: Book) {
    this.books.update(b => [...b, book]);
  }

  deleteBook(id: number) {
    this.books.update(books => books.filter(b => b.id !== id));
  }

  deleteCategory(id: number) {
    this.categories.update(categories => categories.filter(c => c.id !== id));
  }
}
