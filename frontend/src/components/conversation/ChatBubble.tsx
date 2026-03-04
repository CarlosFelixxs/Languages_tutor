interface Props {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatBubble({ role, content }: Props) {
  const isUser = role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
          <span className="text-sm">🎓</span>
        </div>
      )}
      <div
        className={`max-w-xs px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
          ${isUser
            ? 'bg-indigo-600 text-white rounded-tr-sm'
            : 'bg-white text-gray-800 shadow rounded-tl-sm'
          }`}
      >
        {content}
      </div>
    </div>
  )
}
