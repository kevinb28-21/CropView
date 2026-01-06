import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Header from './components/chrome/Header.jsx';
import HomePage from './pages/Home.jsx';
import MapPage from './pages/Map.jsx';
import AnalyticsPage from './pages/Analytics.jsx';
import MLPage from './pages/ML.jsx';
import DronePage from './pages/Drone.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/ml" element={<MLPage />} />
          <Route path="/drone" element={<DronePage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}


