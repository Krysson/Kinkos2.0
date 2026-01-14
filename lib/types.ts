// Database Types for KinkOS 2.0
// Generated from Supabase schema

export type MemberRole = 'member' | 'volunteer' | 'lead' | 'admin' | 'owner'
export type MemberStatus = 'pending' | 'active' | 'suspended' | 'inactive'
export type ShiftStatus = 'open' | 'full' | 'completed' | 'cancelled'
export type AnnouncementPriority = 'low' | 'normal' | 'high' | 'urgent'
export type ResourceCategory = 'policies' | 'training' | 'forms' | 'links' | 'other'

export interface Member {
  id: string
  auth_id: string
  email: string
  display_name: string
  legal_name: string | null
  pronouns: string | null
  phone: string | null
  avatar_url: string | null
  bio: string | null
  role: MemberRole
  status: MemberStatus
  member_since: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  emergency_contact_relationship: string | null
  show_in_contacts: boolean
  show_phone: boolean
  show_email: boolean
  created_at: string
  updated_at: string
}

export interface Shift {
  id: string
  title: string
  description: string | null
  location: string
  start_time: string
  end_time: string
  min_volunteers: number
  max_volunteers: number
  status: ShiftStatus
  created_by: string | null
  lead_volunteer: string | null
  created_at: string
  updated_at: string
}

export interface ShiftSignup {
  id: string
  shift_id: string
  member_id: string
  signed_up_at: string
  cancelled_at: string | null
  notes: string | null
  checked_in: boolean
  checked_in_at: string | null
  no_show: boolean
}

export interface Announcement {
  id: string
  title: string
  content: string
  priority: AnnouncementPriority
  is_published: boolean
  publish_at: string
  expires_at: string | null
  target_roles: MemberRole[] | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface AnnouncementRead {
  id: string
  announcement_id: string
  member_id: string
  read_at: string
}

export interface Resource {
  id: string
  title: string
  description: string | null
  url: string | null
  category: ResourceCategory
  is_active: boolean
  sort_order: number
  required_roles: MemberRole[] | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface AppSetting {
  key: string
  value: unknown
  description: string | null
  updated_at: string
  updated_by: string | null
}

// Extended types with relations
export interface ShiftWithSignups extends Shift {
  signups?: ShiftSignup[]
  signup_count?: number
}

export interface ShiftSignupWithDetails extends ShiftSignup {
  shift?: Shift
  member?: Member
}

export interface AnnouncementWithRead extends Announcement {
  is_read?: boolean
  created_by_member?: Member
}
