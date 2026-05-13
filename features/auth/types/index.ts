export interface AuthUser {
  id: string
  email: string
  full_name: string
  role: 'trainer' | 'company' | 'admin'
}

export interface SignUpData {
  email: string
  password: string
  full_name: string
  role: 'trainer' | 'company'
}

export interface LoginData {
  email: string
  password: string
}