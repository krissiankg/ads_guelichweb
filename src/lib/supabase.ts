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
  portfolio_type: 'web_app' | 'graphic_design';
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: 'super_admin' | 'editor' | 'viewer';
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
}

export interface ProjectSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  project_type: string;
  budget: string;
  description: string;
  consent: boolean;
  status: 'new' | 'read' | 'archived';
  created_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  name: string;
  email: string;
  consent: boolean;
  coupon_code: string;
  coupon_used: boolean;
  coupon_expires_at: string;
  subscribed_at: string;
  unsubscribed_at: string | null;
  created_at: string;
}

export interface VideoPortfolio {
  id: string;
  title: string;
  cover_image_url: string;
  video_url: string;
  video_embed: string;
  video_platform: 'youtube' | 'vimeo' | 'mega' | 'other';
  size_category: 'short' | 'medium' | 'long';
  description: string;
  order_index: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

// Storage helpers
const BUCKET = 'portfolio-images';

export async function uploadImage(file: File, folder: string): Promise<string> {
  const ext = file.name.split('.').pop();
  const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file, { cacheControl: '3600', upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}

export async function deleteImage(url: string): Promise<void> {
  // Extract path from full URL
  const parts = url.split(`/storage/v1/object/public/${BUCKET}/`);
  if (parts.length < 2) return;
  const path = parts[1];

  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) console.error('Error deleting image:', error);
}

