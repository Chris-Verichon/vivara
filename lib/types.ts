// TypeScript types for the Vivàra database schema

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      memories: {
        Row: Memory
        Insert: MemoryInsert
        Update: MemoryUpdate
      }
      media_files: {
        Row: MediaFile
        Insert: MediaFileInsert
        Update: Partial<MediaFileInsert>
      }
      site_config: {
        Row: SiteConfig
        Insert: SiteConfig
        Update: Partial<SiteConfig>
      }
    }
  }
}

export interface Memory {
  id: string
  user_id: string
  title: string
  description: string | null
  memory_date: string // ISO date string YYYY-MM-DD
  country_code: string | null // ISO 3166-1 alpha-2
  country_name: string | null
  tags: string[] | null
  created_at: string
  updated_at: string
}

export type MemoryInsert = Omit<Memory, "id" | "created_at" | "updated_at">
export type MemoryUpdate = Partial<MemoryInsert>

export interface MediaFile {
  id: string
  memory_id: string
  storage_path: string
  file_type: "image" | "video"
  mime_type: string | null
  size_bytes: number | null
  width: number | null
  height: number | null
  thumbnail_path: string | null
  position: number
  created_at: string
}

export type MediaFileInsert = Omit<MediaFile, "id" | "created_at">

export interface SiteConfig {
  key: string
  value: string | null
  updated_at: string
}

// Composite type used throughout the app
export interface MemoryWithMedia extends Memory {
  media_files: MediaFile[]
}
