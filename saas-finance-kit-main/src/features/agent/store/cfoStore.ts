'use client'

import { create } from 'zustand'

interface CFOState {
  isOpen: boolean
  toggle: () => void
  open: () => void
  close: () => void
}

export const useCFOStore = create<CFOState>((set) => ({
  isOpen: false,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}))
