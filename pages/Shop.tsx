
import React, { useState } from 'react';
import { Mob, Item, VehicleType, Warrior } from '../types';
import { SHOP_ITEMS, IZ_IT_SAFE_TABLE, SERJERY_TABLES, INJURY_TO_TABLE_MAP, DA_BIG_DAY_TABLE, BODGE_TABLE } from '../constants';
import { saveMob } from '../services/storageService';

interface ShopProps {
  mob: Mob;
  setMob: React.Dispatch<React.SetStateAction<Mob | null>>;
}

type ShopTab = 'GEAR' | 'MEKS_DOKS' | 'STASH';

const MEK_WEAPON_UPGRADES = ['Shootier (+1 Str)', 'More Dakka (+1 SFD)', 'Longer Range (+6")'];
const MEK_VEHICLE_UPGRADES = ['Faster (+3" Thrust)', 'Smarter (+1 Ld Turn)', 'Eavier (+1 Armour)'];

export const Shop: React.FC<ShopProps> = ({ mob, setMob }) => {
  const [activeTab, setActiveTab] = useState<ShopTab>('GEAR');
  const [selectedWarriorId, setSelectedWarriorId] = useState<string>('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  
  // Mek State
  const [mekAction, setMekAction] = useState<'KUSTOM_WEAPON' | 'KUSTOM_VEHICLE' | 'LOADSA_AMMO' | 'FIX_PERM_DAMAGE' | null>(null);
  const [selectedWeaponIndex, setSelectedWeaponIndex] = useState<number | null>(null);
  const [selectedUpgrade, setSelectedUpgrade] = useState<string>('');
  const [mekCostRoll, setMekCostRoll] = useState<number | null>(null);
  const [mekTableRoll, setMekTableRoll] = useState<number | null>(null);
  const [mekResult, setMekResult] = useState<any>(null);
  const [bodgeResult, setBodgeResult] = useState<string | null>(null);

  // Dok State
  const [dokStep, setDokStep] = useState<number>(1);
  const [selectedInjuryIndex, setSelectedInjuryIndex] = useState<number | null>(null);
  const [izItSafeRoll, setIzItSafeRoll] = useState<number | null>(null);
  const [izItSafeResult, setIzItSafeResult] = useState<any>(null);
  const [bionikTable, setBionikTable] = useState<string>('');
  const [bionikRoll, setBionikRoll] = useState<number | null>(null);
  const [bionikItem, setBionikItem] = useState<Item | null>(null);
  const [dokCostRoll, setDokCostRoll] = useState<number | null>(null);

  const rollDice = (d: number) => Math.floor(Math.random() * d) + 1;

  const handleBuyItem = (item: Item) => {
    if (mob.teef < item.cost) {
      alert("Not enuff teef!");
      return;
    }

    const isVehicleUpgrade = item.type === 'Vehicle Weapon' || item.type === 'Gubbinz' || item.notes?.includes('Vehicle');
    
    if (isVehicleUpgrade) {
        if(!selectedVehicleId) {
            alert("Select a vehicle first!");
            return;
        }
        
        const vehicle = mob.vehicles.find(v => v.id === selectedVehicleId);
        if (vehicle?.type === VehicleType.BIKE) {
            // Bike Restrictions
            const forbiddenItems = ['Harpoon Gun', 'Skorcha', 'Spear Gun', 'Rokkit Launcher', '\'Eavy Shoota', 'Boarding Plank', 'Big Grabber', 'Wrecker Ball'];
            if (forbiddenItems.includes(item.name)) {
                alert("Dat won't fit on a bike ya git!");
                return;
            }
        }
    } else {
        if(!selectedWarriorId) {
            alert("Select a warrior first!");
            return;
        }
        
        const warrior = mob.warriors.find(w => w.id === selectedWarriorId);
        if (item.type === 'Slaver' && warrior?.type !== 'Slaver') {
            alert("Only Slaverz use dat stuff!");
            return;
        }
    }

    const updatedMob = { ...mob, teef: mob.teef - item.cost };

    if (isVehicleUpgrade) {
      updatedMob.vehicles = updatedMob.vehicles.map(v => {
        if (v.id === selectedVehicleId) {
          return { ...v, equipment: [...v.equipment, item] };
        }
        return v;
      });
    } else {
      updatedMob.warriors = updatedMob.warriors.map(w => {
        if (w.id === selectedWarriorId) {
          return { ...w, equipment: [...w.equipment, item] };
        }
        return w;
      });
    }

    setMob(updatedMob);
    saveMob(updatedMob);
  };

  // Mek Logic
  const rollMekPrice = () => {
      setMekCostRoll(rollDice(6));
  };

  const performMekJob = () => {
      const roll = rollDice(6);
      setMekTableRoll(roll);
      const result = DA_BIG_DAY_TABLE.find(r => r.roll === roll);
      setMekResult(result);

      if (result?.outcome === 'Bodge') {
          const br = rollDice(6);
          setBodgeResult(BODGE_TABLE[br-1].desc);
      }
  };

  const applyMekResult = () => {
    if(!selectedVehicleId && !selectedWarriorId) return;
    if(mekCostRoll === null) return;
    
    if (mob.teef < mekCostRoll) {
        alert("Not enuff teef to pay da Mek!");
        return;
    }

    const updatedMob = { ...mob, teef: mob.teef - mekCostRoll };

    // Success logic
    if (mekResult?.outcome === 'Success') {
        if (mekAction === 'KUSTOM_WEAPON' && selectedWeaponIndex !== null) {
             if (selectedVehicleId) {
                updatedMob.vehicles = updatedMob.vehicles.map(v => {
                    if(v.id === selectedVehicleId) {
                        const newEquip = [...v.equipment];
                        const weapon = { ...newEquip[selectedWeaponIndex] };
                        weapon.name = `Kustom: ${selectedUpgrade} - ${weapon.name}`; 
                        weapon.upgrades = [...(weapon.upgrades || []), selectedUpgrade];
                        newEquip[selectedWeaponIndex] = weapon;
                        return { ...v, equipment: newEquip };
                    }
                    return v;
                });
             } else {
                 updatedMob.warriors = updatedMob.warriors.map(w => {
                    if(w.id === selectedWarriorId) {
                        const newEquip = [...w.equipment];
                        const weapon = { ...newEquip[selectedWeaponIndex] };
                        weapon.name = `Kustom: ${selectedUpgrade} - ${weapon.name}`;
                        weapon.upgrades = [...(weapon.upgrades || []), selectedUpgrade];
                        newEquip[selectedWeaponIndex] = weapon;
                        return { ...w, equipment: newEquip };
                    }
                    return w;
                 });
             }
        } else if (mekAction === 'KUSTOM_VEHICLE' && selectedVehicleId) {
             updatedMob.vehicles = updatedMob.vehicles.map(v => {
                 if (v.id === selectedVehicleId) {
                     return { ...v, equipment: [...v.equipment, { id: crypto.randomUUID(), name: `Kustom: ${selectedUpgrade}`, cost: 0, type: 'Gubbinz' }] };
                 }
                 return v;
             });
        } else if (mekAction === 'FIX_PERM_DAMAGE' && selectedVehicleId) {
             updatedMob.vehicles = updatedMob.vehicles.map(v => {
                 if (v.id === selectedVehicleId && v.damage.length > 0) {
                     const newDamage = [...v.damage];
                     newDamage.pop(); // Simplification: remove last damage
                     return { ...v, damage: newDamage };
                 }
                 return v;
             });
        }
    } else if (mekResult?.outcome === 'Bodge') {
        alert(`BODGED: ${bodgeResult}`);
        // Logic to apply bodge effect could go here (add "Bodge" item)
    }

    // Loadsa Ammo (Always succeeds, no roll needed really, but kept in flow)
    if (mekAction === 'LOADSA_AMMO' && selectedWeaponIndex !== null && selectedVehicleId) {
         updatedMob.vehicles = updatedMob.vehicles.map(v => {
            if(v.id === selectedVehicleId) {
                const weapon = v.equipment[selectedWeaponIndex];
                const ammoItem: Item = {
                    id: crypto.randomUUID(),
                    name: `Loadsa Ammo (${weapon.name})`,
                    cost: Math.ceil(weapon.cost / 4),
                    type: 'Gubbinz'
                };
                return { ...v, equipment: [...v.equipment, ammoItem] };
            }
            return v;
        });
    }

    setMob(updatedMob);
    saveMob(updatedMob);
    
    // Reset
    setMekAction(null);
    setMekCostRoll(null);
    setMekTableRoll(null);
    setMekResult(null);
    setSelectedWeaponIndex(null);
  };

  // Dok Logic
  const dokStep1_RollSafe = () => {
      const roll = rollDice(6);
      setIzItSafeRoll(roll);
      const result = IZ_IT_SAFE_TABLE.find(r => r.roll === roll);
      setIzItSafeResult(result);
      setDokCostRoll(rollDice(6));
      
      const warrior = mob.warriors.find(w => w.id === selectedWarriorId);
      const injury = warrior?.injuries[selectedInjuryIndex!];
      
      // Determine table
      let table = 'CHEST'; // Default/Random fallback
      Object.keys(INJURY_TO_TABLE_MAP).forEach(key => {
          if (injury?.includes(key)) table = INJURY_TO_TABLE_MAP[key];
      });

      if (result?.outcome === 'Random_Table') {
          const keys = Object.keys(SERJERY_TABLES);
          table = keys[Math.floor(Math.random() * keys.length)];
      }

      setBionikTable(table);
      setDokStep(2);
  };

  const dokStep2_RollBionik = () => {
      const roll = rollDice(6);
      setBionikRoll(roll);
      const item = SERJERY_TABLES[bionikTable][roll - 1]; // Array is 0 index
      setBionikItem(item);
      setDokStep(3);
  };

  const dokStep3_Apply = () => {
      if (!dokCostRoll) return;
      if (mob.teef < dokCostRoll) return alert("Pay da Dok!");
      
      const updatedMob = { ...mob, teef: mob.teef - dokCostRoll };
      updatedMob.warriors = updatedMob.warriors.map(w => {
          if(w.id === selectedWarriorId) {
              const newInjuries = [...w.injuries];
              
              // If result was Success_Miss, mark injured
              let isInjured = izItSafeResult.outcome === 'Success_Miss' ? true : w.isInjured;

              // Remove injury if successful operation (Most are, except Bodge)
              if (izItSafeResult.outcome !== 'Bodge') {
                  newInjuries.splice(selectedInjuryIndex!, 1);
              }

              // Auto-clear injured status if no injuries remain
              if (newInjuries.length === 0 && !isInjured) {
                  isInjured = false;
              }

              // Add Bionik if generated
              const newEquip = [...w.equipment];
              if (bionikItem) {
                  newEquip.push({ ...bionikItem, id: crypto.randomUUID() });
              }

              return { ...w, injuries: newInjuries, equipment: newEquip, isInjured };
          }
          return w;
      });

      setMob(updatedMob);
      saveMob(updatedMob);
      
      // Reset
      setDokStep(1);
      setIzItSafeRoll(null);
      setBionikItem(null);
      setSelectedInjuryIndex(null);
      setDokCostRoll(null);
  };

  const sellStashItem = (index: number) => {
      if(!confirm("Sell dis item for half price?")) return;
      const item = mob.stash[index];
      const val = Math.floor(item.cost / 2);
      
      const newStash = [...mob.stash];
      newStash.splice(index, 1);
      
      const updatedMob = { ...mob, stash: newStash, teef: mob.teef + val };
      setMob(updatedMob);
      saveMob(updatedMob);
  };

  // Group items
  const groupedItems = SHOP_ITEMS.reduce((acc, item) => {
    const type = item.type || 'Misc';
    if (!acc[type]) acc[type] = [];
    acc[type].push(item);
    return acc;
  }, {} as Record<string, Item[]>);

  const categories = Object.keys(groupedItems);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-zinc-900 p-4 ork-border text-white flex justify-between items-center sticky top-20 z-40 shadow-md border-b-4 border-yellow-600">
        <h1 className="text-3xl font-black text-yellow-500 font-bangers tracking-wider uppercase">Da Mek Shop</h1>
        <div className="text-2xl font-bold bg-black px-4 py-2 ork-border border-yellow-500">
          Teef: <span className="text-yellow-400">{mob.teef}</span>
        </div>
      </div>

      <div className="flex gap-4 border-b-4 border-zinc-700 pb-2 overflow-x-auto">
          <button onClick={() => setActiveTab('GEAR')} className={`text-xl font-black uppercase px-4 py-2 ${activeTab === 'GEAR' ? 'bg-yellow-500 text-black ork-border transform -skew-x-6' : 'text-gray-400'}`}>Buy Gear</button>
          <button onClick={() => setActiveTab('MEKS_DOKS')} className={`text-xl font-black uppercase px-4 py-2 ${activeTab === 'MEKS_DOKS' ? 'bg-yellow-500 text-black ork-border transform -skew-x-6' : 'text-gray-400'}`}>Meks & Doks</button>
          <button onClick={() => setActiveTab('STASH')} className={`text-xl font-black uppercase px-4 py-2 ${activeTab === 'STASH' ? 'bg-yellow-500 text-black ork-border transform -skew-x-6' : 'text-gray-400'}`}>Sell Stash</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-zinc-800 p-4 ork-border shadow-lg">
            <h3 className="font-bold mb-2 uppercase border-b border-gray-600 text-white">Select Warrior</h3>
            <select 
              className="w-full p-2 bg-zinc-900 border border-gray-600 text-white font-medium focus:border-yellow-500 focus:outline-none"
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

          <div className="bg-zinc-800 p-4 ork-border shadow-lg">
            <h3 className="font-bold mb-2 uppercase border-b border-gray-600 text-white">Select Vehicle</h3>
            <select 
              className="w-full p-2 bg-zinc-900 border border-gray-600 text-white font-medium focus:border-yellow-500 focus:outline-none"
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

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-8 pb-10">
          
          {activeTab === 'GEAR' && categories.map(category => (
            <div key={category} className="bg-zinc-800 p-4 ork-border shadow-xl">
              <h2 className="text-2xl font-black text-black bg-yellow-500 inline-block px-4 py-1 mb-4 -rotate-1 border border-black uppercase shadow-sm">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {groupedItems[category].map(item => {
                  const isVehicleItem = item.type === 'Vehicle Weapon' || item.type === 'Gubbinz' || item.notes?.includes('Vehicle');
                  const canBuy = (isVehicleItem && selectedVehicleId) || (!isVehicleItem && selectedWarriorId);
                  
                  return (
                    <div key={item.id} className={`bg-zinc-900 p-3 border border-zinc-700 shadow flex justify-between items-center transition-opacity ${!canBuy ? 'opacity-50' : 'opacity-100'}`}>
                      <div>
                        <div className="font-bold text-white leading-tight">{item.name}</div>
                        {item.notes && <div className="text-xs text-gray-400 font-semibold">{item.notes}</div>}
                      </div>
                      <button 
                        onClick={() => handleBuyItem(item)}
                        disabled={!canBuy}
                        className="bg-green-700 hover:bg-green-600 text-white font-black px-3 py-1 text-sm border border-green-900 disabled:bg-gray-700 disabled:cursor-not-allowed shadow-md"
                      >
                        {item.cost} T
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {activeTab === 'STASH' && (
              <div className="bg-zinc-800 p-4 ork-border shadow-xl">
                  <h2 className="text-2xl font-black text-white mb-4 uppercase">Sell Stash Items</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                      {mob.stash && mob.stash.length > 0 ? mob.stash.map((item, idx) => (
                          <div key={idx} className="bg-zinc-900 p-3 border border-zinc-700 shadow flex justify-between items-center">
                              <span className="text-white font-bold">{item.name}</span>
                              <button onClick={() => sellStashItem(idx)} className="bg-red-700 text-white text-xs px-2 py-1 font-bold">
                                  SELL ({Math.floor(item.cost/2)} T)
                              </button>
                          </div>
                      )) : <p className="text-gray-500">Nuffin' in da stash.</p>}
                  </div>
              </div>
          )}

          {activeTab === 'MEKS_DOKS' && (
              <div className="space-y-6">
                  {/* Mek Section */}
                  <div className="bg-zinc-800 p-6 ork-border text-white relative">
                      <h2 className="text-3xl font-black text-blue-400 mb-4 uppercase tracking-widest">Da Mekboy</h2>
                      {(!selectedVehicleId && !selectedWarriorId) ? (
                          <p className="text-gray-400 italic">Select a vehicle or warrior to start kustomisin'.</p>
                      ) : (
                          <div>
                              <div className="mb-4">
                                  <h3 className="font-bold text-lg mb-2 text-white">1. Choose Job</h3>
                                  <div className="flex flex-wrap gap-2 mb-4">
                                      {/* Vehicle Options */}
                                      {selectedVehicleId && (
                                          <>
                                            <button onClick={() => setMekAction('KUSTOM_VEHICLE')} className={`px-3 py-2 border ${mekAction === 'KUSTOM_VEHICLE' ? 'bg-blue-600 border-white' : 'bg-zinc-900 border-zinc-600'}`}>Kustomise Vehicle</button>
                                            <button onClick={() => setMekAction('FIX_PERM_DAMAGE')} className={`px-3 py-2 border ${mekAction === 'FIX_PERM_DAMAGE' ? 'bg-blue-600 border-white' : 'bg-zinc-900 border-zinc-600'}`}>Fix Permanent Damage</button>
                                            <button onClick={() => setMekAction('LOADSA_AMMO')} className={`px-3 py-2 border ${mekAction === 'LOADSA_AMMO' ? 'bg-blue-600 border-white' : 'bg-zinc-900 border-zinc-600'}`}>Loadsa Ammo</button>
                                          </>
                                      )}
                                      <button onClick={() => setMekAction('KUSTOM_WEAPON')} className={`px-3 py-2 border ${mekAction === 'KUSTOM_WEAPON' ? 'bg-blue-600 border-white' : 'bg-zinc-900 border-zinc-600'}`}>Kustomise Weapon</button>
                                  </div>

                                  {/* Sub Selection for Weapons */}
                                  {(mekAction === 'KUSTOM_WEAPON' || mekAction === 'LOADSA_AMMO') && (
                                      <div className="mb-4">
                                          <h4 className="text-sm font-bold text-gray-400 mb-1">Select Weapon:</h4>
                                          <div className="flex flex-wrap gap-2">
                                              {selectedVehicleId && mob.vehicles.find(v => v.id === selectedVehicleId)?.equipment.filter(e => e.type === 'Vehicle Weapon' || e.type === 'Gunz').map((w, idx) => (
                                                  <button 
                                                    key={idx} 
                                                    onClick={() => { setSelectedWeaponIndex(idx); }}
                                                    className={`px-3 py-2 border ${selectedWeaponIndex === idx ? 'bg-yellow-500 text-black' : 'bg-zinc-900 border-zinc-600'} text-xs font-bold`}
                                                  >
                                                      {w.name}
                                                  </button>
                                              ))}
                                              {selectedWarriorId && mob.warriors.find(w => w.id === selectedWarriorId)?.equipment.filter(e => e.type === 'Gunz').map((w, idx) => (
                                                  <button 
                                                    key={idx} 
                                                    onClick={() => { setSelectedWeaponIndex(idx); }}
                                                    className={`px-3 py-2 border ${selectedWeaponIndex === idx ? 'bg-yellow-500 text-black' : 'bg-zinc-900 border-zinc-600'} text-xs font-bold`}
                                                  >
                                                      {w.name}
                                                  </button>
                                              ))}
                                          </div>
                                      </div>
                                  )}

                                  {/* Upgrade Type Selection */}
                                  {mekAction === 'KUSTOM_WEAPON' && selectedWeaponIndex !== null && (
                                      <div className="mb-4">
                                          <h4 className="text-sm font-bold text-gray-400 mb-1">Select Upgrade:</h4>
                                          <select className="w-full bg-black text-white p-2" onChange={e => setSelectedUpgrade(e.target.value)} value={selectedUpgrade}>
                                              {MEK_WEAPON_UPGRADES.map(u => <option key={u} value={u}>{u}</option>)}
                                          </select>
                                      </div>
                                  )}
                                  {mekAction === 'KUSTOM_VEHICLE' && (
                                      <div className="mb-4">
                                          <h4 className="text-sm font-bold text-gray-400 mb-1">Select Upgrade:</h4>
                                          <select className="w-full bg-black text-white p-2" onChange={e => setSelectedUpgrade(e.target.value)} value={selectedUpgrade}>
                                              {MEK_VEHICLE_UPGRADES.map(u => <option key={u} value={u}>{u}</option>)}
                                          </select>
                                      </div>
                                  )}

                                  {/* Mek Execution */}
                                  {mekAction && (
                                      <div className="bg-black/40 p-4 border border-blue-900">
                                          <div className="flex gap-4 items-center mb-4">
                                              <button onClick={rollMekPrice} disabled={!!mekCostRoll} className="bg-blue-800 text-white px-3 py-1 font-bold">Roll Cost</button>
                                              <div className="text-xl font-bold text-yellow-500">{mekCostRoll ? `${mekCostRoll} Teef` : '???'}</div>
                                          </div>
                                          
                                          <div className="flex gap-4 items-center mb-4">
                                              <button onClick={performMekJob} disabled={!mekCostRoll || !!mekTableRoll} className="bg-blue-600 text-white px-3 py-1 font-bold">DO DA JOB!</button>
                                              <div className="text-lg text-white">{mekResult?.title}</div>
                                          </div>
                                          
                                          {mekResult && (
                                              <div>
                                                  <p className="text-sm text-gray-300 mb-2 italic">{mekResult.desc}</p>
                                                  {bodgeResult && <p className="text-red-400 font-bold mb-2">BODGE: {bodgeResult}</p>}
                                                  <button onClick={applyMekResult} className="w-full bg-green-600 py-2 font-black uppercase">PAY & APPLY</button>
                                              </div>
                                          )}
                                      </div>
                                  )}
                              </div>
                          </div>
                      )}
                  </div>

                  {/* Dok Section */}
                  <div className="bg-zinc-800 p-6 ork-border text-white relative">
                      <h2 className="text-3xl font-black text-green-500 mb-4 uppercase tracking-widest">Da Painboy</h2>
                      {!selectedWarriorId ? (
                          <p className="text-gray-400 italic">Select a warrior to fix 'im up.</p>
                      ) : (
                          <div>
                              {dokStep === 1 && (
                                  <div className="mb-4">
                                      <h3 className="font-bold text-lg mb-2 text-white">Select Injury</h3>
                                      <div className="space-y-2">
                                          {mob.warriors.find(w => w.id === selectedWarriorId)?.injuries.length === 0 && <p className="text-sm text-gray-500">Dis lad is healthy!</p>}
                                          {mob.warriors.find(w => w.id === selectedWarriorId)?.injuries.map((inj, idx) => (
                                              <div key={idx} className={`flex items-center justify-between p-2 border ${selectedInjuryIndex === idx ? 'border-green-500 bg-green-900/20' : 'border-zinc-700 bg-zinc-900'}`}>
                                                  <span>{inj}</span>
                                                  <button 
                                                    onClick={() => setSelectedInjuryIndex(idx)}
                                                    className="text-xs bg-zinc-700 hover:bg-green-600 text-white px-2 py-1"
                                                  >
                                                      Select
                                                  </button>
                                              </div>
                                          ))}
                                      </div>
                                      <button 
                                        onClick={dokStep1_RollSafe} 
                                        disabled={selectedInjuryIndex === null}
                                        className="mt-4 w-full bg-green-700 py-2 font-bold uppercase disabled:opacity-50"
                                      >
                                          Roll: Iz It Safe?
                                      </button>
                                  </div>
                              )}

                              {dokStep === 2 && (
                                  <div className="mb-4 text-center">
                                      <h3 className="text-xl font-black text-green-400 mb-2">{izItSafeResult?.title}</h3>
                                      <p className="text-sm mb-4">{izItSafeResult?.desc}</p>
                                      <p className="text-xs text-gray-400 uppercase">Rolling on: {bionikTable} Table</p>
                                      <button 
                                        onClick={dokStep2_RollBionik} 
                                        className="mt-4 w-full bg-yellow-600 text-black py-2 font-bold uppercase"
                                      >
                                          Roll Bionik
                                      </button>
                                  </div>
                              )}

                              {dokStep === 3 && (
                                  <div className="mb-4 text-center">
                                      <h3 className="text-xl font-black text-green-400 mb-2">Da Dok Fits: {bionikItem?.name}</h3>
                                      <div className="flex gap-4 items-end bg-black/30 p-4 rounded border border-zinc-600 mt-4 text-left">
                                          <div className="flex-1">
                                              <label className="block text-xs uppercase text-gray-400 font-bold mb-1">Bill (Teef)</label>
                                              <div className="text-xl font-bold text-yellow-500">{dokCostRoll} Teef</div>
                                          </div>
                                          <button 
                                            onClick={dokStep3_Apply}
                                            className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 ork-border"
                                          >
                                              PAY & LEAVE
                                          </button>
                                      </div>
                                  </div>
                              )}
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
