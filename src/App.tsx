import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'
import { QuestionnairesListPage } from './pages/QuestionnairesListPage'
import { QuestionnairePage } from './pages/QuestionnairePage'
import { AdminPanelPage } from './pages/AdminPanelPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/questionarios" element={<QuestionnairesListPage />} />
        <Route path="/questionarios/:slug" element={<QuestionnairePage />} />
        <Route path="/painel" element={<AdminPanelPage />} />
        <Route path="/painel/:submissionId" element={<AdminPanelPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
