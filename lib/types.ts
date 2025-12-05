export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: "official" | "admin" | "moderator"
  department: string | null
  title: string | null
  avatar_url: string | null
  is_verified: boolean
  followers_count: number
  following_count: number
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  user_id: string
  content: string
  content_type: "text" | "milestone" | "announcement"
  media_urls: string[]
  likes_count: number
  comments_count: number
  is_pinned: boolean
  created_at: string
  updated_at: string
  profiles?: Profile
  user_has_liked?: boolean
  tags?: Tag[]
  mentions?: Mention[]
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface Tag {
  id: string
  name: string
  posts_count: number
  created_at: string
}

export interface Mention {
  id: string
  post_id: string
  mentioned_user_id: string
  created_at: string
  profiles?: Profile
}

export interface Follow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

export interface Conversation {
  id: string
  name: string | null
  is_group: boolean
  created_by: string | null
  last_message_at: string
  created_at: string
  updated_at: string
  participants?: ConversationParticipant[]
  messages?: Message[]
  other_participant?: Profile
  unread_count?: number
  last_message?: Message
}

export interface ConversationParticipant {
  id: string
  conversation_id: string
  user_id: string
  last_read_at: string
  joined_at: string
  profiles?: Profile
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface Project {
  id: string
  name: string
  description: string | null
  department: string
  lead_id: string | null
  status: "planning" | "in_progress" | "on_hold" | "completed" | "cancelled"
  priority: "low" | "medium" | "high" | "critical"
  budget_allocated: number
  budget_spent: number
  start_date: string | null
  target_end_date: string | null
  actual_end_date: string | null
  progress_percentage: number
  created_at: string
  updated_at: string
  lead?: Profile
  milestones?: Milestone[]
  members?: ProjectMember[]
  updates?: ProjectUpdate[]
}

export interface Milestone {
  id: string
  project_id: string
  title: string
  description: string | null
  status: "pending" | "in_progress" | "completed" | "delayed"
  target_date: string | null
  completed_date: string | null
  progress_percentage: number
  order_index: number
  created_at: string
  updated_at: string
}

export interface ProjectUpdate {
  id: string
  project_id: string
  milestone_id: string | null
  author_id: string
  title: string
  content: string
  update_type: "progress" | "blocker" | "achievement" | "budget" | "delay"
  media_urls: string[]
  created_at: string
  author?: Profile
  milestone?: Milestone
}

export interface ProjectMember {
  id: string
  project_id: string
  user_id: string
  role: "lead" | "member" | "stakeholder" | "observer"
  joined_at: string
  profiles?: Profile
}

export interface BudgetTransaction {
  id: string
  project_id: string
  amount: number
  transaction_type: "allocation" | "expense" | "refund"
  description: string
  receipt_url: string | null
  recorded_by: string
  transaction_date: string
  created_at: string
  recorder?: Profile
}

export interface AuditLog {
  id: string
  user_id: string | null
  action: string
  entity_type: string
  entity_id: string | null
  details: Record<string, unknown>
  ip_address: string | null
  user_agent: string | null
  created_at: string
  user?: Profile
}

export interface SystemSetting {
  id: string
  key: string
  value: unknown
  description: string | null
  updated_by: string | null
  updated_at: string
}

export interface Report {
  id: string
  reporter_id: string
  reported_user_id: string | null
  reported_post_id: string | null
  reason: string
  details: string | null
  status: "pending" | "reviewed" | "resolved" | "dismissed"
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
  reporter?: Profile
  reported_user?: Profile
  reported_post?: Post
  reviewer?: Profile
}

export interface PlatformStats {
  total_users: number
  total_posts: number
  total_projects: number
  total_messages: number
  active_users_today: number
  posts_today: number
  pending_reports: number
}
