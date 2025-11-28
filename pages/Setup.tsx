import React, { useState } from 'react';
import { Mob, WarriorType } from '../types';
import { saveMob } from '../services/storageService';
import { BrainBoy } from '../components/BrainBoy';

interface SetupProps {
  setMob: React.Dispatch<React.SetStateAction<Mob | null>>;
}

export const Setup: React.FC<SetupProps> = ({ setMob }) => {
  const [mobName, setMobName] = useState('');
  const [faction, setFaction] = useState<'Gorkers' | 'Morkers'>('Gorkers');

  const handleCreate = () => {
    if (!mobName) return alert("Enter a name!");
    
    const newMob: Mob = {
      id: crypto.randomUUID(),
      name: mobName,
      faction,
      teef: 100,
      warriors: [],
      vehicles: [],
      battlesFought: 0,
      mobRating: 0
    };

    setMob(newMob);
    saveMob(newMob);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-zinc-800 p-8 ork-border max-w-md w-full text-white">
        <h1 className="text-4xl font-black text-center mb-8 text-yellow-500">NEW MOB</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block font-bold mb-1">Mob Name</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                className="w-full p-2 text-black font-bold" 
                value={mobName}
                onChange={e => setMobName(e.target.value)}
                placeholder="Da Krumpers"
              />
              <BrainBoy onNameGenerated={setMobName} role="Mob" />
            </div>
          </div>

          <div>
            <label className="block font-bold mb-1">Faction</label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input type="radio" checked={faction === 'Gorkers'} onChange={() => setFaction('Gorkers')} className="mr-2 accent-green-500 w-5 h-5" />
                <span className="font-bold text-green-400">Gorkers</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input type="radio" checked={faction === 'Morkers'} onChange={() => setFaction('Morkers')} className="mr-2 accent-blue-500 w-5 h-5" />
                <span className="font-bold text-blue-400">Morkers</span>
              </label>
            </div>
          </div>

          <div className="pt-4">
            <button 
              onClick={handleCreate}
              className="w-full py-3 bg-red-600 font-black text-xl ork-border hover:bg-red-500 btn-ork shadow-[4px_4px_0_#000]"
            >
              START DA WAAAGH!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};