import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import LandingPage from './components/pages/LandingPage';
import Dashboard from './components/pages/Dashboard';
import Drivers from './components/pages/Drivers';
import Circuits from './components/pages/Circuits';
import { RaceSessionProvider } from './context/RaceSessionContext';
import LoadingSpinner from './components/shared/LoadingSpinner';

const StintDeepDive = lazy(() => import('./components/pages/StintDeepDive'));

function App() {
  return (
    <RaceSessionProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingSpinner fullScreen />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/drivers" element={<Drivers />} />
            <Route path="/circuits" element={<Circuits />} />
            <Route path="/dashboard/stint/:stintId" element={<StintDeepDive />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </RaceSessionProvider>
  );
}

export default App;
