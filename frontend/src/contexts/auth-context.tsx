"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { authenticatedApiClient } from '@/lib/api-client'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'

interface User {
  id: number
  email: string
  name?: string
  token?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => void
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (token: string, newPassword: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const verifyToken = async (token: string): Promise<boolean> => {
    try {
      console.log('Verifying token...')
      const response = await authenticatedApiClient.get('/auth/verify')
      console.log('Token verification response:', response.data)
      return response.data && response.data.id != null
    } catch (error: any) {
      console.error('Token verification failed:', error)
      return false
    }
  }

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user')
        if (!storedUser) {
          return
        }

        const userData = JSON.parse(storedUser)
        if (!userData || !userData.token) {
          throw new Error('No token found')
        }

        // Set the token in the API client headers first
        authenticatedApiClient.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`
        
        // Then verify the token
        const isValid = await verifyToken(userData.token)
        if (!isValid) {
          throw new Error('Invalid token')
        }

        setUser(userData)
        setIsAuthenticated(true)
        console.log('Auth initialized successfully')
      } catch (error) {
        console.error('Auth initialization error:', error)
        // Clear invalid auth state
        localStorage.removeItem('user')
        delete authenticatedApiClient.defaults.headers.common['Authorization']
        setUser(null)
        setIsAuthenticated(false)
      }
    }

    initializeAuth()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Making signin request...')
      
      const response = await apiClient.post('/auth/login', { email, password })
      const data = response.data

      console.log('Signin response:', data)

      // Check if we have all required fields
      if (!data.id || !data.email || !data.token) {
        console.error('Missing required fields in response:', data)
        throw new Error('Invalid response data from server')
      }

      const userData = {
        id: data.id,
        email: data.email,
        name: data.name || email.split('@')[0],
        token: data.token
      }

      // Set the token in the API client headers
      authenticatedApiClient.defaults.headers.common['Authorization'] = `Bearer ${data.token}`

      // Store the complete user data including token in both state and localStorage
      setUser(userData)
      setIsAuthenticated(true)
      localStorage.setItem('user', JSON.stringify(userData))
      
      console.log('Successfully signed in:', { email })
    } catch (error: any) {
      console.error('Detailed signin error:', error)
      if (error.message?.includes('Network Error')) {
        throw new Error('Network error. Please check your connection.')
      }
      throw new Error(error.response?.data?.error || error.message || 'Failed to sign in')
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      console.log('Making signup request...')
      
      const response = await apiClient.post('/auth/register', {
        email,
        password,
        name: email.split('@')[0]
      })
      const data = response.data

      console.log('Parsed response data:', data)

      // Check if we have all required fields
      if (!data.id || !data.email || !data.token) {
        console.error('Missing required fields in response:', data)
        throw new Error('Invalid response data from server')
      }

      const userData = {
        id: data.id,
        email: data.email,
        name: data.name || email.split('@')[0],
        token: data.token
      }

      setUser(userData)
      setIsAuthenticated(true)
      localStorage.setItem('user', JSON.stringify(userData))
      
      // Set the token in the API client headers
      authenticatedApiClient.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
      
      console.log('Successfully signed up:', { email })
    } catch (error: any) {
      console.error('Detailed signup error:', error)
      if (error.message?.includes('Network Error')) {
        throw new Error('Network error. Please check your connection.')
      }
      throw new Error(error.response?.data?.error || error.message || 'Failed to sign up')
    }
  }

  const signOut = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('user')
    // Clear any auth-related headers
    delete authenticatedApiClient.defaults.headers.common['Authorization']
  }

  const forgotPassword = async (email: string) => {
    try {
      await authenticatedApiClient.post('/auth/forgot-password', { email })
    } catch (error: any) {
      console.error('Forgot password error:', error)
      throw new Error(error.response?.data?.error || error.message || 'Failed to process forgot password request')
    }
  }

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      await authenticatedApiClient.post('/auth/reset-password', { token, newPassword })
    } catch (error: any) {
      console.error('Reset password error:', error)
      throw new Error(error.response?.data?.error || error.message || 'Failed to reset password')
    }
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, signIn, signUp, signOut, forgotPassword, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 