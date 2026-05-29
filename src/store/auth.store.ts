'use client'
import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types/user.types'
import { createClient } from '@/lib/supabase/client'

interface AuthStore {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (v: boolean) => void
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  profile: null,
  isLoading: true,

  setUser: (user) => set({ user }),

  setProfile: (profile) => set({ profile }),

  setLoading: (v) => set({ isLoading: v }),

  signOut: async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    set({ user: null, profile: null })
  },
}))
