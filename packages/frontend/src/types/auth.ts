export interface User {
  _id: string
  name: string
  email: string
  phone?: string | null
  emailVerified: boolean
  role: 'owner' | 'admin' | 'member'
  workspaceId: string
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

export interface Workspace {
  _id: string
  name: string
  slug: string
  ownerId: string
  status: 'active' | 'suspended'
  createdAt: string
  updatedAt: string
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}
