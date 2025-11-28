import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Setup } from './pages/Setup';
import { MobView } from './pages/MobView';
import { Shop } from './pages/Shop';
import { PostGame } from './pages/PostGame';
import { getMob, clearData } from './services/storageService';
import { Mob } from './types';

const App: React.FC = () => {
  const [mob, setMob] = useState<Mob | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedMob = getMob();
    if (savedMob) setMob(savedMob);
    setLoading(false);
  }, []);

  if (loading) return <div className="text-white text-center mt-10 font-bold text-xl">Loading da boyz...</div>;

  if (!mob) {
    return <Setup setMob={setMob} />;
  }

  return (
    <Router>
      <div className="min-h-screen pb-10">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4">
          <Routes>
            <Route path="/" element={<MobView mob={mob} setMob={setMob} />} />
            <Route path="/shop" element={<Shop mob={mob} setMob={setMob} />} />
            <Route path="/post-game" element={<PostGame mob={mob} setMob={setMob} />} />
            <Route path="/settings" element={
              <div className="bg-zinc-800 p-6 ork-border text-white">
                <h2 className="text-2xl font-black mb-4">Settings</h2>
                <button 
                  onClick={() => {
                    if(confirm("Delete everything? Dis cannot be undone!")) {
                      clearData();
                      setMob(null);
                    }
                  }}
                  className="bg-red-700 text-white font-bold py-2 px-4 border-2 border-white hover:bg-red-600"
                >
                  Reset Campaign Data
                </button>
              </div>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;