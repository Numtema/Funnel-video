export interface User {
  id: string
  email: string
  created_at: string
}

export interface Funnel {
  id: string
  user_id: string
  title: string
  description?: string
  config: FunnelConfig
  ai_insights?: AIInsights
  status: "draft" | "active" | "paused" | "archived"
  views: number
  conversions: number
  created_at: string
  updated_at: string
}

export interface Quiz {
  id: string
  user_id: string
  title: string
  description?: string
  config: QuizConfig
  theme?: QuizTheme
  ai_insights?: AIInsights
  status: "draft" | "active" | "paused" | "archived"
  completions: number
  created_at: string
  updated_at: string
}

export interface Submission {
  id: string
  funnel_id?: string
  quiz_id?: string
  contact_info: ContactInfo
  responses: Record<string, any>
  ai_analysis?: AIAnalysis
  ip_address?: string
  user_agent?: string
  created_at: string
}

export interface FunnelConfig {
  steps: FunnelStep[]
  settings?: FunnelSettings
}

export interface FunnelStep {
  id: string
  type: "landing" | "form" | "video" | "text" | "cta" | "thank-you"
  title: string
  content?: string
  fields?: FormField[]
  media?: MediaConfig
  styling?: StepStyling
}

export interface QuizConfig {
  questions: QuizQuestion[]
  settings?: QuizSettings
}

export interface QuizQuestion {
  id: string
  type: "multiple" | "single" | "text" | "scale" | "boolean"
  question: string
  options?: string[]
  required?: boolean
  scoring?: QuestionScoring
}

export interface FormField {
  id: string
  type: "text" | "email" | "phone" | "select" | "textarea" | "checkbox"
  label: string
  placeholder?: string
  required?: boolean
  options?: string[]
}

export interface ContactInfo {
  email?: string
  phone?: string
  name?: string
  company?: string
  [key: string]: any
}

export interface AIInsights {
  optimizationScore?: number
  suggestions?: string[]
  performance?: PerformanceMetrics
  generatedAt?: string
}

export interface AIAnalysis {
  sentiment?: "positive" | "neutral" | "negative"
  score?: number
  insights?: string[]
  recommendations?: string[]
}

export interface MediaConfig {
  type: "image" | "video" | "audio"
  url: string
  alt?: string
  thumbnail?: string
}

export interface StepStyling {
  backgroundColor?: string
  textColor?: string
  buttonColor?: string
  fontFamily?: string
  layout?: "centered" | "left" | "right"
}

export interface QuizTheme {
  primaryColor?: string
  secondaryColor?: string
  backgroundColor?: string
  textColor?: string
  fontFamily?: string
  layout?: "card" | "list" | "wizard"
}

export interface FunnelSettings {
  redirectUrl?: string
  emailNotifications?: boolean
  trackingEnabled?: boolean
  customCss?: string
}

export interface QuizSettings {
  showProgress?: boolean
  allowBack?: boolean
  randomizeQuestions?: boolean
  timeLimit?: number
  showResults?: boolean
}

export interface QuestionScoring {
  points?: number
  weight?: number
  correctAnswer?: string | string[]
}

export interface PerformanceMetrics {
  conversionRate?: number
  averageTime?: number
  dropOffPoints?: string[]
  topPerformingSteps?: string[]
}

export interface DashboardStats {
  funnel_submissions: number
  quiz_submissions: number
  total_submissions: number
}
