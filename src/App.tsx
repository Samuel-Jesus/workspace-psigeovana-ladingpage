import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'
import { QuestionnairesListPage } from './pages/QuestionnairesListPage'
import { QuestionnairePage } from './pages/QuestionnairePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/questionarios" element={<QuestionnairesListPage />} />
        <Route path="/questionarios/:slug" element={<QuestionnairePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
