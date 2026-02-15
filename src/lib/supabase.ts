import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// Note: Using placeholder values for local development
// Replace with actual Supabase credentials in .env file for full functionality
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('⚠️ Supabase credentials not configured. Some features may not work. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface PortfolioProject {
  id: string;
  title: string;
  category: string;
  thumbnail_url: string;
  project_url: string | null;
  description: string | null;
  summary: string | null;
  features: string[] | null;
  technologies: string[] | null;
  images: string[] | null;
  objectifs: string | null;
  order_index: number;
  is_featured: boolean;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
}
