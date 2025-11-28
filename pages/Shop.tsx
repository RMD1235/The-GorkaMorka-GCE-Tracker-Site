
import React, { useState } from 'react';
import { Mob, Warrior, Vehicle } from '../types';
import { SHOP_ITEMS } from '../constants';
import { saveMob } from '../services/storageService';

interface ShopProps {
  mob: Mob;
  setMob: React.Dispatch<React.SetStateAction<Mob | null>>;
}

type ShopTab = 'GEAR' | 'MEKS_DOKS';

export const Shop: React.FC<ShopProps> = ({ mob, setMob }) => {
  const [activeTab, setActiveTab] = useState<ShopTab>('GEAR');
  const [selectedWarriorId, setSelectedWarriorId] = useState<string>('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [customCost, setCustomCost] = useState<number>(0);

  const handleBuyItem = (item: typeof SHOP_ITEMS[0]) => {
    if (mob.teef < item.cost) {
      alert("Not enuff teef!");
      return;
    }

    const isVehicleUpgrade = item.type === 'Vehicle Weapon' || item.type === 'Gubbinz' || item.notes?.includes('Vehicle');
    
    if (isVehicleUpgrade && !selectedVehicleId) {
      alert("Select a vehicle first!");
      return;
    }
    if (!isVehicleUpgrade && !selectedWarriorId) {
      alert("Select a warrior first!");
      return;
    }

    const updatedMob = { ...mob, teef: mob.teef - item.cost };

    if (isVehicleUpgrade) {
      updatedMob.vehicles = updatedMob.vehicles.map(v => {
        if (v.id === selectedVehicleId) {
          return { ...v, equipment: [...v.equipment, item], cost: v.cost + item.cost };
        }
        return v;
      });
    } else {
      updatedMob.warriors = updatedMob.warriors.map(w => {
        if (w.id === selectedWarriorId) {
          return { ...w, equipment: [...w.equipment, item], cost: w.cost + item.cost };
        }
        return w;
      });
    }

    setMob(updatedMob);
    saveMob(updatedMob);
  };

  const handleMekJob = () => {
    if(!selectedVehicleId) return alert("Select a vehicle!");
    if(customCost <= 0 || mob.teef < customCost) return alert("Enter valid cost/Not enough teef");

    // Repair or Kustom Job
    const updatedMob = { ...mob, teef: mob.teef - customCost };
    
    // Logic: If repair, user manually edits local state? 
    // For now, let's assume repairs clear the damage list. 
    // Ideally this would be granular but for this level of app, let's just clear ALL damage if they pay.
    // Or we just deduct money and let them assume it happened conceptually.
    // Let's implement a "Clear Damage" button specifically.
    
    setMob(updatedMob);
    saveMob(updatedMob);
    alert(`Paid ${customCost} teef to da Mek!`);
    setCustomCost(0);
  };

  const handleClearVehicleDamage = () => {
      if(!selectedVehicleId) return;
      // We don't know the cost, user must decide. We just clear the array.
      if(!confirm("Clear all damage markers on dis vehicle? (Make sure you paid da Mek!)")) return;

      const updatedMob = {
          ...mob,
          vehicles: mob.vehicles.map(v => v.id === selectedVehicleId ? { ...v, damage: [] } : v)
      };
      setMob(updatedMob);
      saveMob(updatedMob);
  };

  const handleDokJob = () => {
      if(!selectedWarriorId) return alert("Select a warrior!");
      if(customCost <= 0 || mob.teef < customCost) return alert("Enter valid cost/Not enough teef");

      const updatedMob = { ...mob, teef: mob.teef - customCost };
      setMob(updatedMob);
      saveMob(updatedMob);
      alert(`Paid ${customCost} teef to da Dok!`);
      setCustomCost(0);
  };

  const handleHealInjury = () => {
      if(!selectedWarriorId) return;
      // Simple heal: clear all injuries? Or pop last one?
      // Let's Clear All for simplicity, assuming user is managing it.
      if(!confirm("Heal all injuries on dis lad? (Make sure you paid da Dok!)")) return;

      const updatedMob = {
          ...mob,
          warriors: mob.warriors.map(w => w.id === selectedWarriorId ? { ...w, injuries: [], isInjured: false } : w)
      };
      setMob(updatedMob);
      saveMob(updatedMob);
  };

  // Group items by type
  const groupedItems = SHOP_ITEMS.reduce((acc, item) => {
    const type = item.type || 'Misc';
    if (!acc[type]) acc[type] = [];
    acc[type].push(item);
    return acc;
  }, {} as Record<string, typeof SHOP_ITEMS>);

  const categories = Object.keys(groupedItems);

  return (
    <div className="space-y-6">
      <div className="bg-zinc-800 p-4 ork-border text-white flex justify-between items-center sticky top-20 z-40 shadow-md">
        <h1 className="text-3xl font-black text-yellow-500 font-bangers tracking-wider">Da Mek Shop</h1>
        <div className="text-2xl font-bold bg-black px-4 py-2 ork-border border-yellow-500">
          Teef: <span className="text-yellow-400">{mob.teef}</span>
        </div>
      </div>

      <div className="flex gap-4 border-b-4 border-zinc-700 pb-2">
          <button onClick={() => setActiveTab('GEAR')} className={`text-xl font-black uppercase px-4 py-2 ${activeTab === 'GEAR' ? 'bg-yellow-500 text-black ork-border' : 'text-gray-400'}`}>Buy Gear</button>
          <button onClick={() => setActiveTab('MEKS_DOKS')} className={`text-xl font-black uppercase px-4 py-2 ${activeTab === 'MEKS_DOKS' ? 'bg-yellow-500 text-black ork-border' : 'text-gray-400'}`}>Meks & Doks</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Buyer Selection */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-4 ork-border shadow-lg">
            <h3 className="font-bold mb-2 uppercase border-b-2 border-black text-zinc-900">Select Warrior</h3>
            <select 
              className="w-full p-2 bg-gray-100 border-2 border-zinc-400 text-black font-medium focus:border-black focus:outline-none"
              value={selectedWarriorId}
              onChange={(e) => {
                setSelectedWarriorId(e.target.value);
                setSelectedVehicleId('');
              }}
            >
              <option value="">-- Select a Lad --</option>
              {mob.warriors.map(w => <option key={w.id} value={w.id}>{w.name} ({w.type})</option>)}
            </select>
          </div>

          <div className="bg-orange-50 p-4 ork-border shadow-lg">
            <h3 className="font-bold mb-2 uppercase border-b-2 border-black text-zinc-900">Select Vehicle</h3>
            <select 
              className="w-full p-2 bg-white border-2 border-zinc-400 text-black font-medium focus:border-black focus:outline-none"
              value={selectedVehicleId}
              onChange={(e) => {
                setSelectedVehicleId(e.target.value);
                setSelectedWarriorId('');
              }}
            >
              <option value="">-- Select a Vehicle --</option>
              {mob.vehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.type})</option>)}
            </select>
          </div>
        </div>

        {/* Shop Items List */}
        <div className="lg:col-span-3 space-y-8 pb-10">
          
          {activeTab === 'GEAR' && categories.map(category => (
            <div key={category} className="bg-zinc-700 p-4 ork-border shadow-xl">
              <h2 className="text-2xl font-black text-white bg-black inline-block px-4 py-1 mb-4 -rotate-1 border border-zinc-500 uppercase">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {groupedItems[category].map(item => {
                  const isVehicleItem = item.type === 'Vehicle Weapon' || item.type === 'Gubbinz' || item.notes?.includes('Vehicle');
                  const canBuy = (isVehicleItem && selectedVehicleId) || (!isVehicleItem && selectedWarriorId);
                  
                  return (
                    <div key={item.id} className={`bg-gray-100 p-3 border-2 border-black shadow flex justify-between items-center transition-opacity ${!canBuy ? 'opacity-60 grayscale' : 'opacity-100'}`}>
                      <div>
                        <div className="font-bold text-black leading-tight">{item.name}</div>
                        {item.notes && <div className="text-xs text-red-700 font-semibold">{item.notes}</div>}
                      </div>
                      <button 
                        onClick={() => handleBuyItem(item)}
                        disabled={!canBuy}
                        className="bg-yellow-500 hover:bg-yellow-400 text-black font-black px-3 py-1 text-sm border-2 border-black disabled:bg-gray-400 disabled:cursor-not-allowed shadow-[2px_2px_0_#000] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                      >
                        {item.cost} T
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {activeTab === 'MEKS_DOKS' && (
              <div className="space-y-6">
                  <div className="bg-zinc-700 p-6 ork-border text-white">
                      <h2 className="text-3xl font-black text-yellow-500 mb-4">Da Mekboy</h2>
                      <p className="mb-4">Kustomize yer gear or fix yer wagons. Roll on da tables in yer book, den pay da Mek.</p>
                      <div className="flex gap-4 items-end bg-zinc-800 p-4 rounded border border-zinc-600">
                          <div className="flex-1">
                              <label className="block text-xs uppercase text-gray-400 font-bold mb-1">Payment (Teef)</label>
                              <input 
                                type="number" 
                                className="w-full p-2 text-black font-bold" 
                                value={customCost} 
                                onChange={(e) => setCustomCost(parseInt(e.target.value) || 0)} 
                              />
                          </div>
                          <button 
                            onClick={handleMekJob}
                            disabled={!selectedVehicleId}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 ork-border disabled:opacity-50"
                          >
                              PAY MEK
                          </button>
                      </div>
                      {selectedVehicleId && (
                          <div className="mt-4 pt-4 border-t border-zinc-600">
                              <button onClick={handleClearVehicleDamage} className="text-red-400 hover:text-white underline text-sm">
                                  Repair (Clear All Damage)
                              </button>
                          </div>
                      )}
                  </div>

                  <div className="bg-zinc-700 p-6 ork-border text-white">
                      <h2 className="text-3xl font-black text-red-500 mb-4">Da Painboy</h2>
                      <p className="mb-4">Get patched up or get bioniks. Pay da Dok!</p>
                      <div className="flex gap-4 items-end bg-zinc-800 p-4 rounded border border-zinc-600">
                          <div className="flex-1">
                              <label className="block text-xs uppercase text-gray-400 font-bold mb-1">Payment (Teef)</label>
                              <input 
                                type="number" 
                                className="w-full p-2 text-black font-bold" 
                                value={customCost} 
                                onChange={(e) => setCustomCost(parseInt(e.target.value) || 0)} 
                              />
                          </div>
                          <button 
                            onClick={handleDokJob}
                            disabled={!selectedWarriorId}
                            className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 ork-border disabled:opacity-50"
                          >
                              PAY DOK
                          </button>
                      </div>
                      {selectedWarriorId && (
                          <div className="mt-4 pt-4 border-t border-zinc-600">
                              <button onClick={handleHealInjury} className="text-red-400 hover:text-white underline text-sm">
                                  Surgery (Clear All Injuries)
                              </button>
                          </div>
                      )}
                  </div>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};
