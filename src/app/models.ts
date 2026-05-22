export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Profile {
  id: number;
  user_id: string;
  name: string;
  date_of_birth: string;
  gender: boolean;
  photo_url?: string;
  created_at: string;
  age?: number;
}

export interface Language {
  id: number;
  name: string;
  country_code: string;
}

export interface CategoryTranslation {
  id: number;
  name: string;
  language: Language;
}

export interface Category {
  id: number;
  photo_url?: string;
  status: boolean;
  created_at: string;
  categoryTranslations: CategoryTranslation[];
  _count?: {
    bookCategories: number;
    profileCategories: number;
  };
}

export interface BookPage {
  id: number;
  page_number: number;
  text_content: string;
  photo_url?: string;
  audio_url?: string;
}

export interface BookTranslation {
  id: number;
  title: string;
  description?: string | null;
  language: Language;
  bookPages?: BookPage[];
}

export interface Book {
  id: number;
  photo_url?: string;
  duration?: number;
  status: boolean;
  category_ids?: number[];
  language?: Language;
  bookPages?: BookPage[];
  bookTranslations?: BookTranslation[];
}

export interface UserWithDetails {
  id: string;
  email: string;
  role: string;
  created_at: string;
  profiles: Profile[];
}

export interface AuthResponse {
  user: User;
  session: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
  };
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}
