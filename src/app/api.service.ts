import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category, Language, Profile, AuthResponse, UserWithDetails, PaginatedResponse } from './models';
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
  getUsers(page = 1, limit = 20, filters?: { name?: string; role?: string }): Observable<PaginatedResponse<UserWithDetails>> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (filters?.name) params = params.set('name', filters.name);
    if (filters?.role) params = params.set('role', filters.role);
    return this.http.get<PaginatedResponse<UserWithDetails>>(`${this.baseUrl}/users`, { params });
  }

  deleteUser(userId: string): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/users/${userId}`);
  }

  // Categories
  getCategories(page = 1, limit = 20, filters?: { name?: string; languageId?: number }): Observable<PaginatedResponse<Category>> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (filters?.name) params = params.set('name', filters.name);
    if (filters?.languageId) params = params.set('language_id', filters.languageId);
    return this.http.get<PaginatedResponse<Category>>(`${this.baseUrl}/categories`, { params });
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
  getAllStories(page = 1, limit = 20, filters?: { name?: string; languageId?: number; categoryId?: number }): Observable<PaginatedResponse<unknown>> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (filters?.name) params = params.set('name', filters.name);
    if (filters?.languageId) params = params.set('language_id', filters.languageId);
    if (filters?.categoryId) params = params.set('category_id', filters.categoryId);
    return this.http.get<PaginatedResponse<unknown>>(`${this.baseUrl}/stories`, { params });
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
