import { useState, useEffect, useRef } from 'react'
import { createSession, getMessages, streamMessage } from '../api'
import { useSessionStore } from '../store'
import type { ChatMessage, ConversationSession } from '../types'

const TOPICS = [
  { id: 'free',          label: 'Conversa Livre',  emoji: '💬' },
  { id: 'restaurant',    label: 'Restaurante',      emoji: '🍽️' },
  { id: 'travel',        label: 'Viagem',           emoji: '✈️' },
  { id: 'introductions', label: 'Apresentações',    emoji: '👋' },
  { id: 'shopping',      label: 'Compras',          emoji: '🛍️' },
]

export default function ConversationPage() {
  const { language } = useSessionStore()
  const [session, setSession] = useState<ConversationSession | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [topic, setTopic] = useState('free')
  const [showTopics, setShowTopics] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const streamRef = useRef('')

  const langLabel = language === 'spanish' ? 'Espanhol 🇪🇸' : 'Russo 🇷🇺'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  const startSession = async (t: string) => {
    setTopic(t)
    setShowTopics(false)
    const s = await createSession(language, t === 'free' ? undefined : t)
    setSession(s)
    const greeting: ChatMessage = {
      role: 'assistant',
      content: language === 'spanish'
        ? `¡Hola! Vamos a practicar español. ¿Cómo estás hoy?`
        : `Привет! Давайте практиковать русский. Как дела?`,
    }
    setMessages([greeting])
  }

  const sendMessage = async () => {
    if (!session || !input.trim() || streaming) return
    const text = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setStreaming(true)
    streamRef.current = ''
    setStreamingText('')

    streamMessage(
      session.id, text, language, topic === 'free' ? undefined : topic,
      (token) => { streamRef.current += token; setStreamingText(streamRef.current) },
      () => {
        setStreaming(false)
        setMessages(prev => [...prev, { role: 'assistant', content: streamRef.current }])
        setStreamingText('')
        getMessages(session.id).then(setMessages)
      },
      () => { setStreaming(false); setStreamingText('') },
    )
  }

  if (showTopics) {
    return (
      <div className="min-h-dvh pb-28 px-4 pt-14">
        <p className="text-white/35 text-[10px] uppercase tracking-[0.2em] mb-1">Conversar</p>
        <h1 className="text-3xl font-bold text-white mb-2">Praticar</h1>
        <p className="text-white/45 text-sm mb-8">{langLabel} com IA 🎓</p>

        <p className="text-white/35 text-[10px] uppercase tracking-[0.2em] mb-3">Escolha o tópico</p>
        <div className="space-y-3">
          {TOPICS.map((t) => (
            <button
              key={t.id}
              onClick={() => startSession(t.id)}
              className="glass w-full flex items-center gap-4 px-5 py-4 text-left
                active:scale-[0.98] transition-all"
            >
              <span className="text-3xl">{t.emoji}</span>
              <span className="text-white font-medium">{t.label}</span>
              <span className="ml-auto text-white/25">›</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-dvh">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-14 pb-4" style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <button onClick={() => { setShowTopics(true); setSession(null); setMessages([]) }} className="text-white/40 active:text-white/70">
          ←
        </button>
        <div>
          <p className="text-white font-semibold text-sm">{langLabel}</p>
          <p className="text-white/35 text-xs">{TOPICS.find(t => t.id === topic)?.label}</p>
        </div>
        <span className="ml-auto text-xl">🎓</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 no-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full glass flex items-center justify-center mr-2 flex-shrink-0 mt-1 text-sm">🎓</div>
            )}
            <div className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
              ${msg.role === 'user'
                ? 'glass glass-purple text-white rounded-tr-sm'
                : 'glass text-white/90 rounded-tl-sm'
              }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {streaming && (
          <div className="flex justify-start mb-3">
            <div className="w-8 h-8 rounded-full glass flex items-center justify-center mr-2 flex-shrink-0 mt-1 text-sm">🎓</div>
            <div className="glass px-4 py-3 rounded-2xl rounded-tl-sm text-white/90 text-sm leading-relaxed max-w-[78%]">
              {streamingText || <span className="text-white/30">digitando...</span>}
              {streamingText && <span className="opacity-60">▌</span>}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 pb-28" style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
            placeholder={language === 'spanish' ? 'Escribe en español...' : 'Пишите по-русски...'}
            disabled={streaming}
            className="flex-1 glass-sm text-white placeholder-white/30 px-4 py-3 text-sm outline-none disabled:opacity-50 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.07)' }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || streaming}
            className="glass-btn glass-purple px-4 py-3 text-sm disabled:opacity-40 rounded-2xl"
          >
            →
          </button>
        </div>
      </div>
    </div>
  )
}
