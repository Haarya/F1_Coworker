import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import LandingPage from './components/pages/LandingPage';
import Dashboard from './components/pages/Dashboard';
import Drivers from './components/pages/Drivers';
import Circuits from './components/pages/Circuits';
import AudioSelection from './components/pages/AudioSelection';
import { RaceSessionProvider } from './context/RaceSessionContext';
import { TransitionProvider } from './context/TransitionContext';
import LoadingSpinner from './components/shared/LoadingSpinner';
import DashboardLayout from './components/layout/DashboardLayout';

const StintDeepDive = lazy(() => import('./components/pages/StintDeepDive'));

function App() {
  return (
    <RaceSessionProvider>
      <TransitionProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingSpinner fullScreen />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/drivers" element={<Drivers />} />
                <Route path="/circuits" element={<Circuits />} />
                <Route path="/audio" element={<AudioSelection />} />
              </Route>
              <Route path="/dashboard/stint/:stintId" element={<StintDeepDive />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TransitionProvider>
    </RaceSessionProvider>
  );
}

export default App;
