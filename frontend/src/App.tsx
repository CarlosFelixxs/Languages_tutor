import { BrowserRouter, Routes, Route } from 'react-router-dom'
import BottomNav from './components/layout/BottomNav'
import HomePage from './pages/HomePage'
import StudyPage from './pages/StudyPage'
import LessonsPage from './pages/LessonsPage'
import LessonDetailPage from './pages/LessonDetailPage'
import ConversationPage from './pages/ConversationPage'
import StatsPage from './pages/StatsPage'

export default function App() {
  return (
    <BrowserRouter>
      {/* Animated gradient mesh background */}
      <div className="liquid-bg" />

      {/* App content */}
      <div className="relative z-10 max-w-lg mx-auto min-h-dvh">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/study" element={<StudyPage />} />
          <Route path="/lessons" element={<LessonsPage />} />
          <Route path="/lessons/:slug" element={<LessonDetailPage />} />
          <Route path="/chat" element={<ConversationPage />} />
          <Route path="/stats" element={<StatsPage />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  )
}
