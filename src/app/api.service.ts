import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category, Language, Profile, AuthResponse, UserWithDetails } from './models';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  // Auth
  login(credentials: unknown): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, credentials);
  }

  signup(userData: unknown): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/auth/signup`, userData);
  }

  refreshToken(refreshToken: string): Observable<{ access_token: string; refresh_token: string; expires_in: number }> {
    return this.http.post<{ access_token: string; refresh_token: string; expires_in: number }>(
      `${this.baseUrl}/auth/refresh`,
      { refresh_token: refreshToken }
    );
  }

  // Users
  getUsers(): Observable<UserWithDetails[]> {
    return this.http.get<UserWithDetails[]>(`${this.baseUrl}/users`);
  }

  // Categories
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/categories`);
  }

  getCategoriesByLanguage(languageId: number): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/categories/languages/${languageId}`);
  }

  getCategory(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.baseUrl}/categories/${id}`);
  }

  createCategory(formData: FormData): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/categories`, formData);
  }

  updateCategory(id: number, formData: FormData): Observable<unknown> {
    return this.http.put(`${this.baseUrl}/categories/${id}`, formData);
  }

  deleteCategory(id: number): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/categories/${id}`);
  }

  // Stories
  getAllStories(): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.baseUrl}/stories`);
  }

  getStoriesByCategory(categoryId: number, languageId: number): Observable<unknown[]> {
    return this.http.get<unknown[]>(`${this.baseUrl}/stories/categories/${categoryId}/languages/${languageId}`);
  }

  getStory(id: number, languageId: number, pages = 5): Observable<unknown> {
    return this.http.get<unknown>(`${this.baseUrl}/stories/${id}/languages/${languageId}?pages=${pages}`);
  }

  createStory(formData: FormData): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/stories`, formData);
  }

  updateStory(id: number, formData: FormData): Observable<unknown> {
    return this.http.put(`${this.baseUrl}/stories/${id}`, formData);
  }

  deleteStory(id: number): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/stories/${id}`);
  }

  // Languages
  getLanguages(): Observable<Language[]> {
    return this.http.get<Language[]>(`${this.baseUrl}/languages`);
  }

  // Profiles
  getUserProfiles(userId: string): Observable<Profile[]> {
    return this.http.get<Profile[]>(`${this.baseUrl}/profiles/users/${userId}`);
  }

  getProfile(id: number): Observable<Profile> {
    return this.http.get<Profile>(`${this.baseUrl}/profiles/${id}`);
  }

  createProfile(formData: FormData): Observable<Profile> {
    return this.http.post<Profile>(`${this.baseUrl}/profiles`, formData);
  }

  updateProfile(id: number, formData: FormData): Observable<Profile> {
    return this.http.put<Profile>(`${this.baseUrl}/profiles/${id}`, formData);
  }

  deleteProfile(id: number): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/profiles/${id}`);
  }
}
