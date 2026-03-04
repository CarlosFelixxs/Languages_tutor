import axios from 'axios'
import type { Card, Deck, Lesson, LessonDetail, StatsOverview, ConversationSession, ChatMessage } from '../types'

const api = axios.create({ baseURL: '/api' })

// Cards & Decks
export const getDecks = (language?: string): Promise<Deck[]> =>
  api.get('/cards/decks', { params: language ? { language } : {} }).then(r => r.data)

export const getDueCards = (language: string, limit = 20): Promise<Card[]> =>
  api.get('/cards/due', { params: { language, limit } }).then(r => r.data)

// Reviews
export const submitReview = (cardId: number, rating: 1 | 2 | 3 | 4, timeMs?: number) =>
  api.post('/reviews/submit', { card_id: cardId, rating, review_time_ms: timeMs }).then(r => r.data)

// Lessons
export const getLessons = (language?: string): Promise<Lesson[]> =>
  api.get('/lessons/', { params: language ? { language } : {} }).then(r => r.data)

export const getLesson = (slug: string): Promise<LessonDetail> =>
  api.get(`/lessons/${slug}`).then(r => r.data)

// Stats
export const getStats = (language?: string): Promise<StatsOverview> =>
  api.get('/stats/overview', { params: language ? { language } : {} }).then(r => r.data)

export const getHeatmap = (): Promise<Record<string, number>> =>
  api.get('/stats/heatmap').then(r => r.data)

// Conversation
export const createSession = (language: string, topic?: string): Promise<ConversationSession> =>
  api.post('/conversation/sessions', { language, topic }).then(r => r.data)

export const getMessages = (sessionId: number): Promise<ChatMessage[]> =>
  api.get(`/conversation/sessions/${sessionId}/messages`).then(r => r.data)

export const explainWord = (language: string, word: string, context?: string): Promise<{ explanation: string }> =>
  api.post('/conversation/explain', { language, word_or_phrase: word, context }).then(r => r.data)

// Streaming message sender — returns EventSource
export function streamMessage(
  sessionId: number,
  content: string,
  language: string,
  topic?: string,
  onToken?: (token: string) => void,
  onDone?: () => void,
  onError?: (err: unknown) => void,
) {
  api.post('/conversation/message/stream', {
    session_id: sessionId,
    content,
    language,
    topic,
  }, {
    responseType: 'text',
    onDownloadProgress: (e) => {
      const text: string = (e.event?.target as XMLHttpRequest)?.responseText || ''
      const lines = text.split('\n')
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const payload = line.slice(6)
          if (payload === '[DONE]') {
            onDone?.()
          } else {
            try {
              const parsed = JSON.parse(payload)
              if (parsed.token) onToken?.(parsed.token)
            } catch { /* ignore */ }
          }
        }
      }
    },
  }).catch(onError)
}
