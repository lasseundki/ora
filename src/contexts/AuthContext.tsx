import { createContext, useContext, useEffect, useState } from 'react'
import type { User } from 'firebase/auth'
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, googleProvider } from '../lib/firebase'

interface AuthContextValue {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  registerWithEmail: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u)
      setLoading(false)
      if (u) await ensureUserDoc(u)
    })
  }, [])

  async function ensureUserDoc(u: User) {
    await setDoc(doc(db, 'users', u.uid, 'profile', 'data'), {
      email:       u.email,
      displayName: u.displayName ?? u.email,
      updatedAt:   serverTimestamp(),
    }, { merge: true })
  }

  async function signInWithGoogle() {
    await signInWithPopup(auth, googleProvider)
  }

  async function signInWithEmail(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password)
  }

  async function registerWithEmail(email: string, password: string) {
    await createUserWithEmailAndPassword(auth, email, password)
  }

  async function logout() {
    await signOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithEmail, registerWithEmail, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
