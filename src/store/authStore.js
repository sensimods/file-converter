// 'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * authStore
 *  • user             → { email, tokensUsed, maxTokens, unlimitedAccessUntil }
 *  • tokenInfo        → { used, max, unlimitedUntil }
 *  • setUser()        → overwrite user
 *  • setTokenInfo()   → overwrite tokenInfo
 *
 * Persisted in sessionStorage so a hard refresh brings back
 * the last-known snapshot instantly (and clears when tab closes).
 */
const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      tokenInfo: { used: 0, max: 20, unlimitedUntil: null },
      setUser:      (user)      => set({ user }),
      setTokenInfo: (tokenInfo) => set({ tokenInfo })
    }),
    {
      name: 'morpho-auth',
      storage: {
        getItem: (key) =>
          typeof window === 'undefined' ? null : sessionStorage.getItem(key),
        setItem: (key, value) =>
          typeof window === 'undefined'
            ? null
            : sessionStorage.setItem(key, value),
        removeItem: (key) =>
          typeof window === 'undefined' ? null : sessionStorage.removeItem(key)
      }
    }
  )
)

export default useAuthStore
