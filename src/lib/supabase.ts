import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 数据库类型定义
export interface User {
  id: string
  email: string
  username: string
  display_name?: string
  avatar_url?: string
  bio?: string
  location?: string
  website?: string
  is_verified?: boolean
  role?: 'user' | 'admin' | 'super_admin'
  follower_count?: number
  following_count?: number
  post_count?: number
  created_at?: string
  updated_at?: string
}

export interface Post {
  id: string
  user_id: string
  content: string
  images?: string[]
  like_count?: number
  comment_count?: number
  share_count?: number
  is_pinned?: boolean
  created_at?: string
  updated_at?: string
  user?: User
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  parent_id?: string
  content: string
  like_count?: number
  created_at?: string
  updated_at?: string
  user?: User
}

export interface Event {
  id: string
  title: string
  description?: string
  image_url?: string
  start_date: string
  end_date?: string
  location?: string
  organizer_id: string
  participant_count?: number
  max_participants?: number
  is_featured?: boolean
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  created_at?: string
  updated_at?: string
  organizer?: User
}

export interface Like {
  id: string
  user_id: string
  post_id?: string
  comment_id?: string
  created_at?: string
}

export interface Follow {
  id: string
  follower_id: string
  following_id: string
  created_at?: string
}

export interface EventParticipant {
  id: string
  event_id: string
  user_id: string
  status?: 'registered' | 'attended' | 'cancelled'
  created_at?: string
}