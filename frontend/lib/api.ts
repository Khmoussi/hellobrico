// API Base Configuration - Updated for NestJS Backend
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const ARTICLE_CATEGORIES = [
  "CONSEILS_TECHNIQUES",
  "REALISATIONS",
  "BUDGET_PLANIFICATION",
  "ARCHITECTURE_FINITIONS",
  "SUIVI_CHANTIER",
] as const

export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number]

export const ARTICLE_CATEGORY_LABELS: Record<ArticleCategory, string> = {
  CONSEILS_TECHNIQUES: "Conseils techniques",
  REALISATIONS: "Realisations",
  BUDGET_PLANIFICATION: "Budget et planification",
  ARCHITECTURE_FINITIONS: "Architecture et finitions",
  SUIVI_CHANTIER: "Suivi chantier",
}

// Types for API responses - Updated for NestJS structure
export interface ApiResponse<T = any> {
  data?: T
  message?: string
  error?: string
}

// NestJS Login Response
export interface LoginPayloadDto {
  user: UserDto
  accessToken: TokenPayloadDto
}

export interface TokenPayloadDto {
  token: string
  expires: string
}

export interface UserDto {
  id: string
  email: string
  name: string
  role: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Lead DTO matching backend
export interface CreateLeadDto {
  projectAddress: string
  city?: string
  district?: string
  propertyType: 'APPARTEMENT' | 'VILLA' | 'BUREAU' | 'LOCAL_COMMERCIAL'
  renovationTypes: string[]
  surfaceM2?: number
  budgetBracket?: string
  description?: string
  fullName: string
  phone: string
  whatsapp?: string
  email: string
  isAbroad?: boolean
  fileIds?: string[]
}

export interface LeadDto {
  id: string
  projectAddress: string
  city?: string
  district?: string
  propertyType: string
  renovationTypes: string[]
  surfaceM2?: number
  budgetBracket?: string
  description?: string
  fullName: string
  phone: string
  whatsapp?: string
  email: string
  isAbroad?: boolean
  fileIds?: string[]
  files?: any[]
  status: string
  assignedTo?: {
    id: string
    firstName?: string | null
    lastName?: string | null
    email?: string | null
  } | null
  createdAt: string
  updatedAt: string
}

export interface AdminUserDto {
  id: string
  firstName?: string | null
  lastName?: string | null
  email?: string | null
  role?: string
}

export interface NotificationDto {
  id: string
  title?: string
  content?: string
  isSeen?: boolean
  createdAt?: string
}

export interface UploadedFileDto {
  id: string
  filename?: string
  publicUrl?: string
  public_url?: string
  mimetype?: string
}

export interface CreateAdminUserDto {
  firstName: string
  lastName: string
  email: string
  password: string
  phone?: string
}

export interface LeadHistoryDto {
  id: string
  createdAt: string
  type: string
  oldStatus?: string | null
  newStatus?: string | null
  note?: string | null
  user?: {
    id: string
    firstName?: string | null
    lastName?: string | null
    email?: string | null
  } | null
}

export interface DashboardKpisDto {
  leadsThisMonth: number
  quotesSentThisMonth: number
  conversionRate: number
  activeProjects: number
}

export interface QuoteFileDto {
  id: string
  filename: string
  publicUrl?: string
  public_url?: string
  mimetype: string
}

export interface QuoteSentByDto {
  id: string
  firstName?: string | null
  lastName?: string | null
  email?: string | null
}

export interface QuoteDto {
  id: string
  sentAt: string
  emailTo: string
  emailSubject: string
  emailBody: string
  file: QuoteFileDto
  sentBy: QuoteSentByDto
}

export interface ProjectFileDto {
  id: string
  publicUrl?: string
  public_url?: string
  protectedUrl?: string
  filename: string
  mimetype: string
}

export interface ProjectSupervisorDto {
  id: string
  firstName?: string | null
  lastName?: string | null
}

export interface ProjectStepDto {
  step: string
  label: string
  isCurrent: boolean
}

export interface ProjectNoteDto {
  id: string
  note: string
  createdAt: string
  user?: {
    id: string
    firstName?: string | null
    lastName?: string | null
    email?: string | null
  } | null
}

export interface ProjectDto {
  id: string
  leadId?: string | null
  name: string
  address: string
  propertyType: string
  renovationTypes?: string[] | null
  budgetBracket?: string | null
  status: string
  supervisor?: ProjectSupervisorDto | null
  startDate?: string | null
  endDate?: string | null
  currentStep: string
  steps?: ProjectStepDto[]
  files?: ProjectFileDto[]
}

export interface UpdateProjectStepDto {
  currentStep: string
}

export interface UpdateProjectStatusDto {
  status: string
}

// Article DTOs
export interface ArticleDto {
  id: string
  title: string
  excerpt?: string
  content: string
  category: string
  status: string
  slug?: string
  publishedAt?: string
  coverImageId?: string
  coverImage?: {
    id: string
    publicUrl: string
    public_url?: string
    fullImageUrl?: string
  }
  author?: {
    id: string
    firstName: string
    lastName: string
  }
  tags?: string[]
  views?: number
  createdAt: string
  updatedAt: string
}

interface FileLike {
  publicUrl?: string
  public_url?: string
  fullImageUrl?: string
}

export const resolveMediaUrl = (url?: string | null): string | null => {
  if (!url) return null
  if (/^https?:\/\//i.test(url)) return url
  if (url.startsWith('//')) return `https:${url}`
  if (url.startsWith('/')) return `${API_BASE_URL}${url}`
  return `${API_BASE_URL}/${url}`
}

export const getFilePublicUrl = (file?: FileLike | null): string | null => {
  if (!file) return null
  return resolveMediaUrl(file.publicUrl || file.public_url || file.fullImageUrl || null)
}

export interface CreateArticleDto {
  title: string
  excerpt?: string | null
  content: string
  category: string
  coverImageId?: string | null
}

export interface UpdateArticleDto {
  title?: string
  excerpt?: string | null
  content?: string
  category?: string
  coverImageId?: string | null
  status?: 'BROUILLON' | 'PUBLIE'
}


// Try multiple common backend ports
const POSSIBLE_PORTS = [3000, 3001, 8000, 5000, 4000]

// Test function to find working backend port
async function findWorkingBackendPort(): Promise<string> {
  return "http://localhost:3000";
}

// Dynamic API client that finds working backend
class ApiClient {
  private baseURL: string
  private isInitialized = false

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async ensureInitialized() {
    if (!this.isInitialized) {
      this.isInitialized = true
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      await this.ensureInitialized()
      const url = `${this.baseURL}${endpoint}`

      const headers = new Headers(options.headers || undefined)
      const method = (options.method || 'GET').toUpperCase()
      const isFormDataBody = options.body instanceof FormData

      if (!isFormDataBody && method !== 'GET' && method !== 'HEAD' && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json')
      }
      
      const response = await fetch(url, {
        headers,
        ...options,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', errorText)
        
        // Handle different error types
        if (response.status === 0 || (typeof navigator !== 'undefined' && !navigator.onLine)) {
          throw new Error('Network error - please check if backend is running')
        }
        
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      // Check if response has content before parsing JSON
      const contentType = response.headers.get('content-type')
      let data = null
      
      if (contentType && contentType.includes('application/json')) {
        // Only try to parse JSON if content-type is JSON
        const text = await response.text()
        if (text.trim()) {
          try {
            data = JSON.parse(text)
          } catch (parseError) {
            console.error('JSON Parse Error:', parseError)
            console.error('Response text:', text)
            throw new Error(`Invalid JSON response: ${text}`)
          }
        } else {
          // Empty response for successful operations (like DELETE)
          data = { success: true }
        }
      } else {
        // Handle non-JSON responses
        const text = await response.text()
        if (text.trim()) {
          throw new Error(`Non-JSON response: ${text}`)
        } else {
          data = { success: true }
        }
      }
      
      return data && data.data !== undefined ? data : { data }
    } catch (error) {
      console.error('API Error:', error)
      
      // Provide more helpful error messages
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          return {
            error: 'Backend not reachable. Trying to find backend on different ports...'
          }
        }
        return { error: error.message }
      }
      
      return {
        error: 'Unknown error occurred while connecting to backend'
      }
    }
  }

  async get<T>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
  }

  async post<T>(endpoint: string, data?: any, token?: string): Promise<ApiResponse<T>> {
    const isFormData = data instanceof FormData
    
    return this.request<T>(endpoint, {
      method: 'POST',
      body: isFormData ? data : (data ? JSON.stringify(data) : undefined),
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
  }

  async put<T>(endpoint: string, data?: any, token?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
  }

  async patch<T>(endpoint: string, data?: any, token?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
  }

  async delete<T>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)

// Updated API endpoints for NestJS
export const api = {
  // Health check first
  health: () => apiClient.get<any>('/health'),
  
  // Authentication - Updated for NestJS
  auth: {
    login: (email: string, password: string) =>
      apiClient.post<LoginPayloadDto>('/auth/login', { email, password }),
    me: async (token: string) => {
      const v1 = await apiClient.get<UserDto>('/v1/auth/me', token)
      if (!v1.error) return v1
      return apiClient.get<UserDto>('/auth/me', token)
    },
  },

  // Admin Dashboard
  admin: {
    getKpis: (token: string) => apiClient.get<DashboardKpisDto>('/admin/dashboard/kpis', token),
    getRecentLeads: (limit?: number, token?: string) => 
      apiClient.get<LeadDto[]>(`/admin/dashboard/recent-leads${limit ? `?limit=${limit}` : ''}`, token),
    
    // Leads Management
    leads: {
      getAll: (token: string, page = 1, take = 50) => 
        apiClient.get<any>(`/admin/leads?order=DESC&page=${page}&take=${take}`, token),
      getById: (id: string, token: string) =>
        apiClient.get<LeadDto>(`/admin/leads/${id}`, token),
      getNotes: (id: string, token: string) =>
        apiClient.get<LeadHistoryDto[]>(`/admin/leads/${id}/notes`, token),
      getHistory: (id: string, token: string) =>
        apiClient.get<LeadHistoryDto[]>(`/admin/leads/${id}/history`, token),
      updateStatus: (id: string, status: string, token: string) =>
        apiClient.patch<LeadDto>(`/admin/leads/${id}/status`, { status }, token),
      assign: (id: string, assignedToId: string | null, token: string) =>
        apiClient.patch<LeadDto>(
          `/admin/leads/${id}/assign`,
          assignedToId ? { assignedToId } : {},
          token,
        ),
      addNote: (id: string, note: string, token: string) =>
        apiClient.post<LeadDto>(`/admin/leads/${id}/notes`, { note }, token),
    },

    users: {
      getAll: (token: string, page = 1, take = 100) =>
        apiClient.get<any>(`/admin/users?order=DESC&page=${page}&take=${take}`, token),
      createCommercial: (data: CreateAdminUserDto, token: string) =>
        apiClient.post<AdminUserDto>('/admin/users/commercial', data, token),
      createSupervisor: (data: CreateAdminUserDto, token: string) =>
        apiClient.post<AdminUserDto>('/admin/users/supervisor', data, token),
    },

    // Quotes (Devis) Management
    quotes: {
      getForLead: (leadId: string, token: string) =>
        apiClient.get<QuoteDto[]>(`/admin/leads/${leadId}/quotes`, token),
      sendForLead: (leadId: string, file: File, token: string) => {
        const formData = new FormData()
        formData.append('file', file)
        return apiClient.post<QuoteDto>(`/admin/leads/${leadId}/quotes`, formData, token)
      },
    },

    // Projects Management
    projects: {
      getAll: (token: string, page = 1, take = 50) =>
        apiClient.get<any>(`/admin/projects?order=DESC&page=${page}&take=${take}`, token),
      getById: (id: string, token: string) =>
        apiClient.get<ProjectDto>(`/admin/projects/${id}`, token),
      createFromLead: (leadId: string, token: string) =>
        apiClient.post<ProjectDto>(`/admin/projects/from-lead/${leadId}`, undefined, token),
      updateStatus: (id: string, data: UpdateProjectStatusDto, token: string) =>
        apiClient.patch<ProjectDto>(`/admin/projects/${id}/status`, data, token),
      updateStep: (id: string, data: UpdateProjectStepDto, token: string) =>
        apiClient.patch<ProjectDto>(`/admin/projects/${id}/step`, data, token),
      getNotes: (id: string, token: string) =>
        apiClient.get<ProjectNoteDto[]>(`/admin/projects/${id}/notes`, token),
      addNote: (id: string, note: string, token: string) =>
        apiClient.post<ProjectDto>(`/admin/projects/${id}/notes`, { note }, token),
      assignSupervisor: (id: string, supervisorId: string, token: string) =>
        apiClient.patch<ProjectDto>(`/admin/projects/${id}/supervisor`, { supervisorId }, token),
      delete: (id: string, token: string) =>
        apiClient.delete<void>(`/admin/projects/${id}`, token),
    },

    // Magazine Management
    articles: {
      getAll: (token: string, page = 1, take = 50) => 
        apiClient.get<any>(`/admin/articles?order=DESC&page=${page}&take=${take}`, token),
      getById: (id: string, token: string) => 
        apiClient.get<ArticleDto>(`/admin/articles/${id}`, token),
      create: (data: CreateArticleDto, token: string) => 
        apiClient.post<ArticleDto>('/admin/articles', data, token),
      update: (id: string, data: UpdateArticleDto, token: string) => 
        apiClient.patch<ArticleDto>(`/admin/articles/${id}`, data, token),
    }
  },

  users: {
    admin: (token: string) => apiClient.get<{ text: string }>('/users/admin', token),
    getAll: (token: string, page = 1, take = 50) =>
      apiClient.get<any>(`/users?order=DESC&page=${page}&take=${take}`, token),
    getById: (id: string, token: string) => apiClient.get<UserDto>(`/users/${id}`, token),
  },

  notifications: {
    getAll: (token: string) => apiClient.get<NotificationDto[]>('/notifications', token),
    markSeen: (id: string, token: string) =>
      apiClient.patch<NotificationDto>(`/notifications/${id}/seen`, undefined, token),
    markAllRead: (token: string) =>
      apiClient.post<{ success?: boolean }>('/notifications/mark-all-read', undefined, token),
  },

  // Public Magazine
  articles: {
    getAll: (page = 1, take = 50) =>
      apiClient.get<any>(`/articles?order=DESC&page=${page}&take=${take}`),
    getById: (id: string) =>
      apiClient.get<ArticleDto>(`/articles/${id}`),
  },

  // Leads - Updated for NestJS
  leads: {
    create: (leadData: CreateLeadDto) => {
      // Try both /leads and /api/leads
      return apiClient.post<LeadDto>('/leads', leadData)
    },
  },

  // File upload - Updated for NestJS
  upload: {
    uploadFile: (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      return apiClient.post<{ id: string; public_url: string }>('/files/upload', formData)
    },
    uploadFiles: (files: File[]) => {
      const formData = new FormData()
      files.forEach((file) => formData.append('files', file))
      return apiClient.post<{ id: string; public_url: string }[]>('/files/upload-multiple', formData)
    },
    findByIds: (ids: string[], token?: string) => {
      const query = ids.map((id) => encodeURIComponent(id)).join(',')
      return apiClient.get<UploadedFileDto[]>(`/files/find-by-ids?ids=${query}`, token)
    },
    deleteFile: (id: string, token?: string) => apiClient.delete<void>(`/files/${id}`, token),
  },

  email: {
    send: (to: string, subject: string, content: string, token?: string) =>
      apiClient.post<{ message: string; error?: string }>(
        '/email/send',
        { to, subject, content },
        token,
      ),
  },
}

// Error handling utility
export const handleApiError = (error: any): string => {
  if (error?.message) return error.message
  if (typeof error === 'string') return error
  return 'An unexpected error occurred'
}
