import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './components/pages/LandingPage';
import IntroVideoPage from './components/pages/IntroVideoPage';
import Dashboard from './components/pages/Dashboard';
import StintDeepDive from './components/pages/StintDeepDive';
import { RaceSessionProvider } from './context/RaceSessionContext';

function App() {
  return (
    <RaceSessionProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/intro" element={<IntroVideoPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/stint/:stintId" element={<StintDeepDive />} />
        </Routes>
      </BrowserRouter>
    </RaceSessionProvider>
  );
}

export default App;
