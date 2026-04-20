/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react'

const AuthContext = createContext()
const storageKey = 'pett_auth_mock_user'

const getStoredUser = () => {
  try {
    const savedUser = localStorage.getItem(storageKey)
    return savedUser ? JSON.parse(savedUser) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser)
  const loading = false

  const loginWithGoogle = async () => {
    // Simulating Google OAuth 2.0 flow
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUser = {
          uid: 'google-mock-123',
          email: 'user@example.com',
          displayName: 'Boss Lover',
          photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky',
        }
        setUser(mockUser)
        localStorage.setItem(storageKey, JSON.stringify(mockUser))
        resolve(mockUser)
      }, 1000)
    })
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(storageKey)
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
