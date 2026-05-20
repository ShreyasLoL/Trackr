import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Charts from './pages/Charts';
import Onboarding from './pages/Onboarding';
import useProfile from './hooks/useProfile';
import useLogs from './hooks/useLogs';

export default function App() {
  const { profile, saveProfile, hasOnboarded } = useProfile();
  const { getLog, saveLog, getAllLogs } = useLogs();

  if (!hasOnboarded) {
    return <Onboarding onComplete={saveProfile} />;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-cream">
        <Navbar />
        <main>
          <Routes>
            <Route
              path="/"
              element={
                <Dashboard
                  profile={profile}
                  getLog={getLog}
                  saveLog={saveLog}
                />
              }
            />
            <Route
              path="/charts"
              element={
                <Charts profile={profile} getAllLogs={getAllLogs} />
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
