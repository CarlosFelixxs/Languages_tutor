import { useState, useEffect, useRef } from 'react'
import { createSession, getMessages, streamMessage } from '../api'
import ChatBubble from '../components/conversation/ChatBubble'
import { useSessionStore } from '../store'
import type { ChatMessage, ConversationSession } from '../types'

const TOPICS = [
  { id: 'free', label: 'Conversa Livre', emoji: '💬' },
  { id: 'restaurant', label: 'Restaurante', emoji: '🍽️' },
  { id: 'travel', label: 'Viagem', emoji: '✈️' },
  { id: 'introductions', label: 'Apresentações', emoji: '👋' },
  { id: 'shopping', label: 'Compras', emoji: '🛍️' },
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

  const langLabel = language === 'spanish' ? 'Espanhol 🇪🇸' : 'Russo 🇷🇺'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  const startSession = async (t: string) => {
    setTopic(t)
    setShowTopics(false)
    const s = await createSession(language, t === 'free' ? undefined : t)
    setSession(s)
    const topicLabel = TOPICS.find(x => x.id === t)?.label || ''
    const greeting: ChatMessage = {
      role: 'assistant',
      content: language === 'spanish'
        ? `¡Hola! Vamos a practicar español${topicLabel && t !== 'free' ? ` — tema: ${topicLabel}` : ''}. ¿Cómo estás hoy?`
        : `Привет! Давайте практиковать русский${topicLabel && t !== 'free' ? ` — тема: ${topicLabel}` : ''}. Как дела?`,
    }
    setMessages([greeting])
  }

  const sendMessage = async () => {
    if (!session || !input.trim() || streaming) return
    const text = input.trim()
    setInput('')
    const userMsg: ChatMessage = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setStreaming(true)
    setStreamingText('')

    streamMessage(
      session.id,
      text,
      language,
      topic === 'free' ? undefined : topic,
      (token) => setStreamingText(prev => prev + token),
      () => {
        setStreaming(false)
        setMessages(prev => [...prev, { role: 'assistant', content: streamingText }])
        setStreamingText('')
        // Reload from server to get saved messages
        getMessages(session.id).then(setMessages)
      },
      () => { setStreaming(false); setStreamingText('') },
    )
  }

  if (showTopics) {
    return (
      <div className="min-h-screen pb-20 px-4 pt-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Conversar</h1>
        <p className="text-gray-500 text-sm mb-6">Praticar {langLabel} com IA</p>

        <h2 className="text-sm font-semibold text-gray-400 uppercase mb-3">Escolha o tópico</h2>
        <div className="space-y-3">
          {TOPICS.map((t) => (
            <button
              key={t.id}
              onClick={() => startSession(t.id)}
              className="w-full bg-white rounded-xl p-4 flex items-center gap-4 shadow-sm text-left
                active:scale-[0.98] transition-transform border border-transparent
                hover:border-indigo-200"
            >
              <span className="text-3xl">{t.emoji}</span>
              <span className="font-medium text-gray-900">{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="bg-white border-b px-4 pt-12 pb-3 flex items-center gap-3">
        <button onClick={() => { setShowTopics(true); setSession(null); setMessages([]) }} className="text-gray-400">
          ←
        </button>
        <div>
          <p className="font-semibold text-gray-900">{langLabel}</p>
          <p className="text-xs text-gray-400">{TOPICS.find(t => t.id === topic)?.label}</p>
        </div>
        <span className="ml-auto text-lg">🎓</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50">
        {messages.map((msg, i) => (
          <ChatBubble key={i} role={msg.role} content={msg.content} />
        ))}
        {streaming && streamingText && (
          <ChatBubble role="assistant" content={streamingText + '▌'} />
        )}
        {streaming && !streamingText && (
          <div className="flex justify-start mb-3">
            <div className="bg-white rounded-2xl px-4 py-3 shadow text-gray-400 text-sm">
              digitando...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t px-4 py-3 pb-safe flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
          placeholder={language === 'spanish' ? 'Escribe en español...' : 'Пишите по-русски...'}
          disabled={streaming}
          className="flex-1 bg-gray-100 rounded-xl px-4 py-3 text-sm outline-none
            placeholder:text-gray-400 disabled:opacity-50"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || streaming}
          className="bg-indigo-600 text-white rounded-xl px-4 py-3 font-semibold
            disabled:opacity-50 active:scale-95 transition-transform"
        >
          →
        </button>
      </div>
    </div>
  )
}
