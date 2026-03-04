import { create } from 'zustand'
import type { Card } from '../types'

interface SessionState {
  language: 'spanish' | 'russian'
  cards: Card[]
  index: number
  isFlipped: boolean
  correct: number
  incorrect: number
  startTime: number

  setLanguage: (lang: 'spanish' | 'russian') => void
  setCards: (cards: Card[]) => void
  flip: () => void
  next: () => void
  recordCorrect: () => void
  recordIncorrect: () => void
  reset: () => void
}

export const useSessionStore = create<SessionState>((set) => ({
  language: 'spanish',
  cards: [],
  index: 0,
  isFlipped: false,
  correct: 0,
  incorrect: 0,
  startTime: 0,

  setLanguage: (lang) => set({ language: lang }),
  setCards: (cards) => set({ cards, index: 0, isFlipped: false, correct: 0, incorrect: 0, startTime: Date.now() }),
  flip: () => set((s) => ({ isFlipped: !s.isFlipped })),
  next: () => set((s) => ({ index: s.index + 1, isFlipped: false, startTime: Date.now() })),
  recordCorrect: () => set((s) => ({ correct: s.correct + 1 })),
  recordIncorrect: () => set((s) => ({ incorrect: s.incorrect + 1 })),
  reset: () => set({ cards: [], index: 0, isFlipped: false, correct: 0, incorrect: 0 }),
}))
