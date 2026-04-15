"use client"

import { createContext, useContext, useState, ReactNode } from 'react'

interface MockUser {
  id: string
  name: string
  email: string
  picture: string
}

interface MockAuthContextType {
  user: MockUser | null
  isAuthenticated: boolean
  login: () => void
  logout: () => void
}

const MockAuthContext = createContext<MockAuthContextType | undefined>(undefined)

// Hardcoded user for whiteboarding
const MOCK_USER: MockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  picture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
}

export function MockAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(MOCK_USER) // Start logged in for whiteboarding
  const [isAuthenticated, setIsAuthenticated] = useState(true)

  const login = () => {
    setUser(MOCK_USER)
    setIsAuthenticated(true)
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <MockAuthContext.Provider value={{
      user,
      isAuthenticated,
      login,
      logout
    }}>
      {children}
    </MockAuthContext.Provider>
  )
}

export function useMockAuth() {
  const context = useContext(MockAuthContext)
  if (context === undefined) {
    throw new Error('useMockAuth must be used within a MockAuthProvider')
  }
  return context
}