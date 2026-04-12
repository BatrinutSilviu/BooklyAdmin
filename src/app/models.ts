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
  created_at: string;
  categoryTranslations: CategoryTranslation[];
  _count?: {
    storyCategories: number;
    profileCategories: number;
  };
}

export interface StoryPage {
  id: number;
  page_number: number;
  text_content: string;
}

export interface StoryTranslation {
  id: number;
  title: string;
  description?: string | null;
  language: Language;
  storyPages?: StoryPage[];
}

export interface Story {
  id: number;
  title: string;
  photo_url?: string;
  audio_url?: string;
  story_series_id?: number;
  category_ids?: number[];
  language?: Language;
  storyPages?: StoryPage[];
  storyTranslations?: StoryTranslation[];
}

export interface Series {
  id: number;
  titles: Record<string, string>;
  descriptions?: Record<string, string>;
  status: 'Public' | 'Private';
  contentRating: string;
  stories: number[];
}

export interface Playlist {
  id: number;
  profile_id: number;
  name: string;
  created_at: string;
  playlistStories?: unknown[];
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
