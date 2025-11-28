
import React, { useState } from 'react';
import { Mob, Warrior, WarriorType, VehicleType, Vehicle, StatLine } from '../types';
import { BASE_STATS, BASE_COSTS, VEHICLE_COSTS, STARTING_XP_BASE, XP_BRACKETS } from '../constants';
import { saveMob } from '../services/storageService';
import { BrainBoy } from '../components/BrainBoy';

interface MobViewProps {
  mob: Mob;
  setMob: React.Dispatch<React.SetStateAction<Mob | null>>;
}

export const MobView: React.FC<MobViewProps> = ({ mob, setMob }) => {
  const [recruitName, setRecruitName] = useState('');
  const [recruitType, setRecruitType] = useState<WarriorType>(WarriorType.BOY);
  
  const [vehicleName, setVehicleName] = useState('');
  const [vehicleRole, setVehicleRole] = useState<VehicleType>(VehicleType.TRANSPORT);
  const [vehiclePropulsion, setVehiclePropulsion] = useState<'Wheels' | 'Tracks'>('Wheels');

  // State for Level Up Modal
  const [levelUpWarriorId, setLevelUpWarriorId] = useState<string | null>(null);
  const [statChoice, setStatChoice] = useState<keyof StatLine | 'Skill'>('WS');

  const calculateMobRating = (currentMob: Mob) => {
    let rating = 0;
    currentMob.warriors.forEach(w => {
      rating += w.cost + w.experience;
    });
    currentMob.vehicles.forEach(v => {
      rating += v.cost;
      v.equipment.forEach(e => rating += e.cost);
    });
    return rating;
  };

  const rollDice = (d: number) => Math.floor(Math.random() * d) + 1;

  const handleRecruitWarrior = () => {
    const cost = BASE_COSTS[recruitType];
    if (mob.teef < cost) {
      alert("Not enuff Teef, ya git!");
      return;
    }

    // Calculate Initial XP
    const baseXP = STARTING_XP_BASE[recruitType];
    const initialXP = baseXP > 0 ? baseXP + rollDice(6) : 0;

    const newWarrior: Warrior = {
      id: crypto.randomUUID(),
      name: recruitName || `Unnamed ${recruitType}`,
      type: recruitType,
      stats: { ...BASE_STATS[recruitType] },
      cost: cost,
      experience: initialXP,
      equipment: [],
      injuries: [],
      isInjured: false,
    };

    const updatedMob = {
      ...mob,
      teef: mob.teef - cost,
      warriors: [...mob.warriors, newWarrior],
    };
    updatedMob.mobRating = calculateMobRating(updatedMob);
    
    setMob(updatedMob);
    saveMob(updatedMob);
    setRecruitName('');
  };

  const handleBuyVehicle = () => {
    const cost = VEHICLE_COSTS[vehicleRole];
    
    if (mob.teef < cost) {
      alert("Not enuff Teef!");
      return;
    }

    const newVehicle: Vehicle = {
      id: crypto.randomUUID(),
      name: vehicleName || `Unnamed ${vehicleRole}`,
      type: vehicleRole,
      propulsion: vehiclePropulsion,
      cost: cost,
      equipment: [],
      damage: []
    };

    const updatedMob = {
      ...mob,
      teef: mob.teef - cost,
      vehicles: [...mob.vehicles, newVehicle],
    };
    updatedMob.mobRating = calculateMobRating(updatedMob);

    setMob(updatedMob);
    saveMob(updatedMob);
    setVehicleName('');
  };

  const fireWarrior = (id: string) => {
    if(!confirm("Are ya sure you wanna boot dis lad? His kit stays wit da mob.")) return;
    
    const updatedMob = { 
      ...mob, 
      warriors: mob.warriors.filter(w => w.id !== id) 
    };
    updatedMob.mobRating = calculateMobRating(updatedMob);
    setMob(updatedMob);
    saveMob(updatedMob);
  };

  const scrapVehicle = (id: string) => {
    if(!confirm("Scrap dis wagon?")) return;
    const updatedMob = {
        ...mob,
        vehicles: mob.vehicles.filter(v => v.id !== id)
    };
    updatedMob.mobRating = calculateMobRating(updatedMob);
    setMob(updatedMob);
    saveMob(updatedMob);
  };

  // --- Level Up Logic ---
  const getLevel = (xp: number) => {
    return XP_BRACKETS.findIndex(threshold => xp < threshold) - 1;
  };

  // We roughly estimate level based on XP to prompt for upgrades.
  // In a real DB we would store 'currentLevel' on the warrior to track pending upgrades.
  // For this simple version, we'll just let users manually click "Advance" if they think they are due.
  // OR we calculate if they are due. But without storing 'level', we don't know if they already took it.
  // Strategy: Just provide an "Advance" button that is always active, rely on user honesty/rules knowledge.
  
  const handleLevelUp = () => {
    if (!levelUpWarriorId) return;
    const warriorIndex = mob.warriors.findIndex(w => w.id === levelUpWarriorId);
    if (warriorIndex === -1) return;

    const updatedWarriors = [...mob.warriors];
    const warrior = { ...updatedWarriors[warriorIndex] };

    if (statChoice === 'Skill') {
        // Skill doesn't change stats, just conceptually added. 
        // In a full app we'd add it to a skills list. 
        // For now we add a note or just assume user writes it down elsewhere?
        // Let's assume we just increment cost to reflect value if needed, 
        // but typically Gorkamorka rating increases via XP, not cost for skills.
        // We'll just close for now, user tracks skill externally or we add a skill text field later.
        alert("Skill added! (Write it down on yer sheet)");
    } else {
        // Stat increase
        warrior.stats = {
            ...warrior.stats,
            [statChoice]: warrior.stats[statChoice] + 1
        };
    }

    updatedWarriors[warriorIndex] = warrior;
    const updatedMob = { ...mob, warriors: updatedWarriors };
    updatedMob.mobRating = calculateMobRating(updatedMob);
    
    setMob(updatedMob);
    saveMob(updatedMob);
    setLevelUpWarriorId(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-zinc-800 p-6 ork-border text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl font-black select-none pointer-events-none">WAAAGH</div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-4xl text-yellow-500 mb-2 font-bangers tracking-wide">{mob.name}</h1>
            <div className="flex gap-4 text-sm font-mono">
              <span className="bg-red-700 px-2 py-1 rounded ork-border shadow-sm">Faction: {mob.faction}</span>
              <span className="bg-blue-700 px-2 py-1 rounded ork-border shadow-sm">Rating: {mob.mobRating}</span>
              <span className="bg-green-700 px-2 py-1 rounded ork-border shadow-sm">Battles: {mob.battlesFought}</span>
            </div>
          </div>
          <div className="mt-4 md:mt-0 text-right">
            <div className="text-sm text-gray-300 uppercase font-bold">Current Teef</div>
            <div className="text-5xl font-black text-yellow-400 drop-shadow-md">{mob.teef}</div>
          </div>
        </div>
      </div>

      {/* Warriors List */}
      <div className="space-y-4">
        <h2 className="text-2xl text-white font-black bg-black inline-block px-4 py-1 -rotate-1 border-2 border-white">Da Boyz</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mob.warriors.map(warrior => (
            <div key={warrior.id} className={`bg-gray-100 p-4 ork-border relative shadow-lg ${warrior.isInjured ? 'opacity-90 grayscale' : ''}`}>
              {warrior.isInjured && <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rotate-3 border border-black">INJURED</div>}
              <div className="flex justify-between items-start mb-2 border-b-2 border-black pb-2">
                <div>
                  <h3 className="font-black text-xl uppercase text-zinc-900 leading-none">{warrior.name}</h3>
                  <div className="text-xs font-bold text-zinc-600 uppercase">{warrior.type}</div>
                </div>
                <div className="flex gap-1">
                    <button 
                        onClick={() => setLevelUpWarriorId(warrior.id)}
                        className="bg-blue-600 text-white hover:bg-blue-500 border border-black px-2 rounded font-bold text-xs"
                    >
                        ADVANCE
                    </button>
                    <button 
                        onClick={() => fireWarrior(warrior.id)} 
                        className="text-red-600 hover:text-white hover:bg-red-600 border border-red-600 px-1 rounded font-bold text-xs transition-colors"
                        title="Remove from Mob"
                    >
                        BOOT
                    </button>
                </div>
              </div>
              
              <div className="grid grid-cols-9 gap-1 text-center text-sm font-bold font-mono mb-3 bg-white p-1 border border-gray-300 text-black">
                <div><div className="text-xxs text-gray-500 uppercase">M</div>{warrior.stats.M}</div>
                <div><div className="text-xxs text-gray-500 uppercase">WS</div>{warrior.stats.WS}</div>
                <div><div className="text-xxs text-gray-500 uppercase">BS</div>{warrior.stats.BS}</div>
                <div><div className="text-xxs text-gray-500 uppercase">S</div>{warrior.stats.S}</div>
                <div><div className="text-xxs text-gray-500 uppercase">T</div>{warrior.stats.T}</div>
                <div><div className="text-xxs text-gray-500 uppercase">W</div>{warrior.stats.W}</div>
                <div><div className="text-xxs text-gray-500 uppercase">I</div>{warrior.stats.I}</div>
                <div><div className="text-xxs text-gray-500 uppercase">A</div>{warrior.stats.A}</div>
                <div><div className="text-xxs text-gray-500 uppercase">Ld</div>{warrior.stats.Ld}</div>
              </div>

              <div className="text-sm space-y-1 text-zinc-800">
                <div className="flex justify-between border-b border-gray-300 pb-1">
                  <span className="text-gray-600">Experience:</span>
                  <span className="font-bold">{warrior.experience}</span>
                </div>
                <div className="flex justify-between border-b border-gray-300 pb-1">
                  <span className="text-gray-600">Value:</span>
                  <span className="font-bold">{warrior.cost} Teef</span>
                </div>
                <div className="pt-1">
                  <span className="text-xs text-gray-500 font-bold uppercase block">Gear:</span>
                  <div className="text-xs font-medium leading-snug min-h-[1.5rem]">
                    {warrior.equipment.length > 0 ? warrior.equipment.map(e => e.name).join(', ') : <span className="text-gray-400 italic">No equipment</span>}
                  </div>
                </div>
                {warrior.injuries.length > 0 && (
                  <div className="text-red-700 text-xs mt-2 font-bold bg-red-50 p-1 border border-red-200">
                    <span className="uppercase">Injuries:</span> {warrior.injuries.join(', ')}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Recruit Card */}
          <div className="bg-zinc-700 p-4 ork-border border-dashed flex flex-col gap-3">
            <h3 className="text-white font-bold text-center uppercase tracking-wider">Recruit New Lad</h3>
            <div className="flex items-center gap-1">
              <input 
                type="text" 
                placeholder="Name" 
                className="w-full p-2 text-sm bg-zinc-800 text-white border border-gray-500 focus:border-yellow-500 focus:outline-none"
                value={recruitName}
                onChange={(e) => setRecruitName(e.target.value)}
              />
              <BrainBoy onNameGenerated={setRecruitName} role={recruitType} />
            </div>
            <select 
              className="w-full p-2 text-sm bg-zinc-800 text-white border border-gray-500 focus:border-yellow-500 focus:outline-none"
              value={recruitType}
              onChange={(e) => setRecruitType(e.target.value as WarriorType)}
            >
              {Object.values(WarriorType).map(t => (
                <option key={t} value={t}>{t} ({BASE_COSTS[t]} Teef + {STARTING_XP_BASE[t]}+D6 XP)</option>
              ))}
            </select>
            <button 
              onClick={handleRecruitWarrior}
              className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 ork-border btn-ork mt-auto uppercase tracking-wide"
            >
              HIRE ({BASE_COSTS[recruitType]} Teef)
            </button>
          </div>
        </div>
      </div>

      {/* Vehicles List */}
      <div className="space-y-4">
        <h2 className="text-2xl text-white font-black bg-black inline-block px-4 py-1 -rotate-1 border-2 border-white">Da Garage</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mob.vehicles.map(vehicle => (
            <div key={vehicle.id} className="bg-orange-50 p-4 ork-border shadow-lg">
              <div className="flex justify-between items-start border-b-2 border-black pb-2 mb-2">
                <div>
                  <h3 className="font-black text-xl uppercase text-zinc-900">{vehicle.name}</h3>
                  <div className="text-xs font-bold text-zinc-600 uppercase">
                    {vehicle.type} <span className="text-zinc-500">({vehicle.propulsion})</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-zinc-900">{vehicle.cost} Teef</div>
                  <button onClick={() => scrapVehicle(vehicle.id)} className="text-xs text-red-500 hover:underline">Scrap</button>
                </div>
              </div>
              <div className="text-sm text-zinc-800">
                <div className="mb-2">
                  <span className="font-bold text-xs uppercase text-zinc-500">Upgrades:</span>
                  <div className="text-xs min-h-[1.5em] font-medium">
                    {vehicle.equipment.length > 0 ? vehicle.equipment.map(e => e.name).join(', ') : <span className="text-gray-400 italic">Stock</span>}
                  </div>
                </div>
                {vehicle.damage.length > 0 && (
                  <div className="text-red-700 text-xs font-bold bg-red-100 p-1 border border-red-300">
                    <span className="uppercase block text-red-900">Permanent Damage:</span>
                    {vehicle.damage.join(', ')}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Buy Vehicle Card */}
          <div className="bg-zinc-700 p-4 ork-border border-dashed flex flex-col gap-3">
            <h3 className="text-white font-bold text-center uppercase tracking-wider">Buy New Wagon</h3>
            <input 
              type="text" 
              placeholder="Vehicle Name" 
              className="w-full p-2 text-sm bg-zinc-800 text-white border border-gray-500 focus:border-yellow-500 focus:outline-none"
              value={vehicleName}
              onChange={(e) => setVehicleName(e.target.value)}
            />
            
            <div className="flex gap-2">
              <select 
                className="w-full p-2 text-sm bg-zinc-800 text-white border border-gray-500 focus:border-yellow-500 focus:outline-none"
                value={vehicleRole}
                onChange={(e) => setVehicleRole(e.target.value as VehicleType)}
              >
                {Object.values(VehicleType).map(t => (
                  <option key={t} value={t}>{t} ({VEHICLE_COSTS[t]} Teef)</option>
                ))}
              </select>

              <select
                className="w-full p-2 text-sm bg-zinc-800 text-white border border-gray-500 focus:border-yellow-500 focus:outline-none"
                value={vehiclePropulsion}
                onChange={(e) => setVehiclePropulsion(e.target.value as 'Wheels' | 'Tracks')}
              >
                <option value="Wheels">Wheels</option>
                <option value="Tracks">Tracks</option>
              </select>
            </div>

            <button 
              onClick={handleBuyVehicle}
              className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-2 px-4 ork-border btn-ork mt-auto uppercase tracking-wide"
            >
              BUILD IT ({VEHICLE_COSTS[vehicleRole]} Teef)
            </button>
          </div>
        </div>
      </div>

      {/* Level Up Modal */}
      {levelUpWarriorId && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-zinc-800 p-6 ork-border max-w-sm w-full text-white">
                <h3 className="text-xl font-bold mb-4 text-yellow-500 uppercase">Advance Warrior</h3>
                <p className="mb-4 text-sm text-gray-300">Choose yer upgrade (Roll on table first, den pick result):</p>
                <select 
                    value={statChoice} 
                    onChange={(e) => setStatChoice(e.target.value as any)}
                    className="w-full p-2 mb-4 bg-zinc-700 border border-gray-500"
                >
                    <option value="WS">Weapon Skill (+1)</option>
                    <option value="BS">Ballistic Skill (+1)</option>
                    <option value="S">Strength (+1)</option>
                    <option value="T">Toughness (+1)</option>
                    <option value="W">Wounds (+1)</option>
                    <option value="I">Initiative (+1)</option>
                    <option value="A">Attacks (+1)</option>
                    <option value="Ld">Leadership (+1)</option>
                    <option value="Skill">New Skill</option>
                </select>
                <div className="flex gap-2">
                    <button onClick={handleLevelUp} className="flex-1 bg-green-600 py-2 font-bold ork-border hover:bg-green-500">APPLY</button>
                    <button onClick={() => setLevelUpWarriorId(null)} className="flex-1 bg-red-600 py-2 font-bold ork-border hover:bg-red-500">CANCEL</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
