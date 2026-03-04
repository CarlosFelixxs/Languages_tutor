export interface Card {
  id: number
  deck_id: number
  front: string
  back: string
  pronunciation?: string
  example_pt?: string
  example_target?: string
  grammar_note?: string
  tags: string[]
  srs_state?: string
  reps?: number
}

export interface Deck {
  id: number
  name: string
  language: string
  description?: string
  is_builtin: number
  card_count: number
  due_count: number
}

export interface ChatMessage {
  id?: number
  role: 'user' | 'assistant'
  content: string
  created_at?: string
}

export interface ConversationSession {
  id: number
  language: string
  topic?: string
  started_at: string
}

export interface StatsOverview {
  streak: number
  total_cards: number
  due_today: number
  reviewed_today: number
}

export interface Lesson {
  id: number
  language: string
  title: string
  slug: string
  lesson_type: string
  order_idx: number
}

export interface LessonDetail extends Lesson {
  content: {
    sections: LessonSection[]
  }
}

export type LessonSection =
  | { type: 'intro'; text: string }
  | { type: 'tip'; text: string }
  | { type: 'warning'; title: string; items: WarningItem[] }
  | { type: 'alphabet_grid'; title: string; letters: AlphabetLetter[] }
  | { type: 'grammar_table'; title: string; rows: GrammarRow[] }

export interface WarningItem {
  pt?: string
  es?: string
  ru?: string
  trap?: string
  cyrillic?: string
  looks_like?: string
  actually_is?: string
  example?: string
}

export interface AlphabetLetter {
  cyrillic: string
  sound: string
  example_ru: string
  example_pt: string
}

export interface GrammarRow {
  [key: string]: string
}
