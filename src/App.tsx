import { BrowserRouter, Routes, Route } from 'react-router'
import { LandingPage } from './pages/LandingPage'
import { QuizPage } from './pages/QuizPage'

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/quiz/:topicId" element={<QuizPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
