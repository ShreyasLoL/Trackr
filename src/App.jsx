import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './contexts/AppContext'
import { GymProvider } from './contexts/GymContext'
import { NutritionProvider } from './contexts/NutritionContext'
import { CardioProvider } from './contexts/CardioContext'
import Navbar from './components/Navbar'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Gym from './pages/Gym'
import Nutrition from './pages/Nutrition'
import Settings from './pages/Settings'
import Heatmap from './pages/Heatmap'

function AppRoutes() {
  const { hasOnboarded } = useApp()

  if (!hasOnboarded) {
    return <Onboarding />
  }

  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/gym" element={<Gym />} />
          <Route path="/nutrition" element={<Nutrition />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/heatmap" element={<Heatmap />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <GymProvider>
          <NutritionProvider>
            <CardioProvider>
              <AppRoutes />
            </CardioProvider>
          </NutritionProvider>
        </GymProvider>
      </AppProvider>
    </BrowserRouter>
  )
}
