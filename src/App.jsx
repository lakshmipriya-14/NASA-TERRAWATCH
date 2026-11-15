import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Overview from './pages/Overview';
import WaterWatch from './pages/WaterWatch';
import ForestWatch from './pages/ForestWatch';
import AgroWatch from './pages/AgroWatch';
import GeoMotion from './pages/GeoMotion';
import Explorer from './pages/Explorer';
import DataSources from './pages/DataSources';
import About from './pages/About';

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-space-950 text-slate-100 flex flex-col font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        {/* Sticky Top Navbar */}
        <Navbar onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/water" element={<WaterWatch />} />
            <Route path="/forest" element={<ForestWatch />} />
            <Route path="/agro" element={<AgroWatch />} />
            <Route path="/geo" element={<GeoMotion />} />
            <Route path="/explorer" element={<Explorer />} />
            <Route path="/sources" element={<DataSources />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
