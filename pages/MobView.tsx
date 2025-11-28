
import React, { useState } from 'react';
import { Mob, Warrior, WarriorType, VehicleType, Vehicle, StatLine, Skill, Item } from '../types';
import { BASE_STATS, BASE_COSTS, VEHICLE_COSTS, STARTING_XP_BASE, XP_BRACKETS, SKILL_TABLES, SKILL_ACCESS, MAX_STATS } from '../constants';
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

  // Level Up
  const [advanceWarriorId, setAdvanceWarriorId] = useState<string | null>(null);
  const [advanceMode, setAdvanceMode] = useState<'STAT' | 'SKILL'>('STAT');
  const [statChoice, setStatChoice] = useState<keyof StatLine>('WS');
  const [skillTable, setSkillTable] = useState<string>('Muscle');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  // Manual Edit
  const [editModeId, setEditModeId] = useState<string | null>(null);

  // Stash Mode
  const [stashMode, setStashMode] = useState(false);

  // Pit Fight
  const [pitFightMode, setPitFightMode] = useState(false);
  const [fighter1, setFighter1] = useState<string>('');
  const [fighter2, setFighter2] = useState<string>('');

  const calculateMobRating = (currentMob: Mob) => {
    let rating = 0;
    currentMob.warriors.forEach(w => {
      rating += w.cost;
      w.equipment.forEach(e => rating += e.cost);
      rating += Math.floor(w.experience / 10);
    });
    currentMob.vehicles.forEach(v => {
      rating += v.cost;
      v.equipment.forEach(e => {
          rating += e.cost;
          if (e.upgrades) rating += (e.upgrades.length * 5);
      });
    });
    return rating;
  };

  const getWarriorValue = (warrior: Warrior) => {
    let val = warrior.cost;
    warrior.equipment.forEach(e => val += e.cost);
    val += Math.floor(warrior.experience / 10);
    return val;
  };

  const getVehicleValue = (vehicle: Vehicle) => {
    let val = vehicle.cost;
    vehicle.equipment.forEach(e => {
        val += e.cost;
        if (e.upgrades) val += (e.upgrades.length * 5);
    });
    return val;
  };

  const getEffectiveStats = (warrior: Warrior): StatLine => {
      const stats = { ...warrior.stats };
      
      // Basic injury logic (simplified based on injury name strings)
      warrior.injuries.forEach(inj => {
          if (inj.includes('Leg Wound')) stats.M = Math.max(0, stats.M - 1);
          if (inj.includes('Arm Wound')) stats.S = Math.max(1, stats.S - 1); // Impact handled in combat usually, but visual here
          if (inj.includes('Chest Wound')) stats.T = Math.max(1, stats.T - 1);
          if (inj.includes('Blinded')) stats.BS = Math.max(1, stats.BS - 1);
      });
      return stats;
  };

  const getAvailableAdvances = (warrior: Warrior) => {
      const currentLevel = XP_BRACKETS.filter(t => warrior.experience >= t).length;
      // Start level is based on the CLASS base, not the individual roll
      const startXP = STARTING_XP_BASE[warrior.type];
      const startLevel = XP_BRACKETS.filter(t => startXP >= t).length;
      
      // Total advances earned in career = Current Brackets Passed - Starting Brackets Passed
      const earnedLevels = Math.max(0, currentLevel - startLevel);
      
      // Available = Earned - Taken
      return Math.max(0, earnedLevels - warrior.advances);
  };

  const getNextThreshold = (xp: number) => {
    const next = XP_BRACKETS.find(t => t > xp);
    return next !== undefined ? next : 'MAX';
  };

  const rollDice = (d: number) => Math.floor(Math.random() * d) + 1;

  const handleRecruitWarrior = () => {
    const cost = BASE_COSTS[recruitType];
    if (mob.teef < cost) {
      alert("Not enuff Teef, ya git!");
      return;
    }

    const baseXP = STARTING_XP_BASE[recruitType];
    const initialXP = baseXP > 0 ? baseXP + rollDice(6) : 0;

    // Calculate if the initial D6 push them over a threshold
    // If so, we set advances to 1 (or more) so they don't trigger a level up immediately
    const startLevelBase = XP_BRACKETS.filter(t => baseXP >= t).length;
    const startLevelActual = XP_BRACKETS.filter(t => initialXP >= t).length;
    const initialAdvances = Math.max(0, startLevelActual - startLevelBase);

    const newWarrior: Warrior = {
      id: crypto.randomUUID(),
      name: recruitName || `Unnamed ${recruitType}`,
      type: recruitType,
      stats: { ...BASE_STATS[recruitType] },
      cost: cost,
      experience: initialXP,
      advances: initialAdvances, 
      equipment: [],
      injuries: [],
      skills: [],
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
    if(!window.confirm("Are ya sure you wanna boot dis lad? His gear goes to da stash.")) return;
    
    // Find warrior
    const warriorToFire = mob.warriors.find(w => w.id === id);
    if (!warriorToFire) return;

    // Separate equipment
    const gearToStash = [...warriorToFire.equipment];
    
    // Create new array excluding this warrior
    const newWarriorList = mob.warriors.filter(w => w.id !== id);
    
    // Create new stash array
    const newStash = [...(mob.stash || []), ...gearToStash];

    const updatedMob = { 
      ...mob, 
      warriors: newWarriorList,
      stash: newStash
    };
    
    // Recalculate rating
    updatedMob.mobRating = calculateMobRating(updatedMob);
    
    setMob(updatedMob);
    saveMob(updatedMob);
  };

  const scrapVehicle = (id: string) => {
    if(!window.confirm("Scrap dis wagon? Gear goes to stash.")) return;
    
    const vehicle = mob.vehicles.find(v => v.id === id);
    if (!vehicle) return;

    const newStash = [...(mob.stash || []), ...vehicle.equipment];

    const updatedMob = {
        ...mob,
        vehicles: mob.vehicles.filter(v => v.id !== id),
        stash: newStash
    };
    updatedMob.mobRating = calculateMobRating(updatedMob);
    setMob(updatedMob);
    saveMob(updatedMob);
  };

  const applyAdvance = () => {
    if (!advanceWarriorId) return;
    const warriorIndex = mob.warriors.findIndex(w => w.id === advanceWarriorId);
    if (warriorIndex === -1) return;

    const warrior = { ...mob.warriors[warriorIndex] };
    const maxStats = warrior.type === 'Grot' ? MAX_STATS['GROT'] : MAX_STATS['ORK'];

    if (advanceMode === 'STAT') {
      if (warrior.stats[statChoice] >= maxStats[statChoice]) {
        alert(`Dat stat is already maxed at ${maxStats[statChoice]}! Pick annuver one or a skill.`);
        return;
      }
      warrior.stats[statChoice] += 1;
    } else {
      if (!selectedSkill) return;
      warrior.skills.push(selectedSkill);
    }

    warrior.advances += 1;
    
    const updatedWarriors = [...mob.warriors];
    updatedWarriors[warriorIndex] = warrior;
    
    const updatedMob = { ...mob, warriors: updatedWarriors };
    updatedMob.mobRating = calculateMobRating(updatedMob);
    setMob(updatedMob);
    saveMob(updatedMob);
    setAdvanceWarriorId(null);
    setSelectedSkill(null);
  };

  const handleManualStatChange = (warriorId: string, stat: keyof StatLine, val: string) => {
    const num = parseInt(val) || 0;
    const updatedWarriors = mob.warriors.map(w => {
      if (w.id === warriorId) {
        return { ...w, stats: { ...w.stats, [stat]: num } };
      }
      return w;
    });
    setMob({ ...mob, warriors: updatedWarriors });
    saveMob({ ...mob, warriors: updatedWarriors });
  };

  const removeSkill = (warriorId: string, skillIndex: number) => {
    if(!confirm("Remove dis skill?")) return;
    const updatedWarriors = mob.warriors.map(w => {
        if(w.id === warriorId) {
            const newSkills = [...w.skills];
            newSkills.splice(skillIndex, 1);
            return { ...w, skills: newSkills };
        }
        return w;
    });
    setMob({ ...mob, warriors: updatedWarriors });
    saveMob({ ...mob, warriors: updatedWarriors });
  };

  // Stash Management
  const equipFromStash = (warriorId: string, itemIndex: number, isVehicle = false) => {
      const item = mob.stash[itemIndex];
      const newStash = [...mob.stash];
      newStash.splice(itemIndex, 1);

      let updatedMob = { ...mob, stash: newStash };

      if (isVehicle) {
          updatedMob.vehicles = updatedMob.vehicles.map(v => 
              v.id === warriorId ? { ...v, equipment: [...v.equipment, item] } : v
          );
      } else {
          updatedMob.warriors = updatedMob.warriors.map(w => 
              w.id === warriorId ? { ...w, equipment: [...w.equipment, item] } : w
          );
      }
      
      updatedMob.mobRating = calculateMobRating(updatedMob);
      setMob(updatedMob);
      saveMob(updatedMob);
  };

  const unequipToStash = (warriorId: string, itemIndex: number, isVehicle = false) => {
      let item: Item | undefined;
      let updatedMob = { ...mob };

      if (isVehicle) {
          updatedMob.vehicles = updatedMob.vehicles.map(v => {
              if (v.id === warriorId) {
                  item = v.equipment[itemIndex];
                  const newEq = [...v.equipment];
                  newEq.splice(itemIndex, 1);
                  return { ...v, equipment: newEq };
              }
              return v;
          });
      } else {
          updatedMob.warriors = updatedMob.warriors.map(w => {
              if (w.id === warriorId) {
                  item = w.equipment[itemIndex];
                  const newEq = [...w.equipment];
                  newEq.splice(itemIndex, 1);
                  return { ...w, equipment: newEq };
              }
              return w;
          });
      }

      if (item) {
          updatedMob.stash = [...(updatedMob.stash || []), item];
          updatedMob.mobRating = calculateMobRating(updatedMob);
          setMob(updatedMob);
          saveMob(updatedMob);
      }
  };

  // Pit Fight
  const resolvePitFight = () => {
      if (!fighter1 || !fighter2 || fighter1 === fighter2) return alert("Pick two different fighters!");
      
      // Simple resolution: Highest roll wins (abstracted)
      // Gain XP logic
      const w1 = mob.warriors.find(w => w.id === fighter1);
      const w2 = mob.warriors.find(w => w.id === fighter2);
      if (!w1 || !w2) return;

      const roll1 = rollDice(6);
      const roll2 = rollDice(6);
      
      const winner = roll1 > roll2 ? w1 : roll2 > roll1 ? w2 : null;
      
      let msg = `${w1.name} rolled ${roll1}, ${w2.name} rolled ${roll2}. `;
      if (winner) {
          msg += `${winner.name} wins! They gain 5 XP. Loser gains D6 XP.`;
      } else {
          msg += "Draw! Both gain D6 XP.";
      }

      const updatedWarriors = mob.warriors.map(w => {
          if (w.id === fighter1 || w.id === fighter2) {
              let xp = rollDice(6); // Participation
              if (winner && w.id === winner.id) {
                  xp = 5; // Winner fixed bonus (replacing participation per rules usually, but simplified here to flat 5 win, D6 lose)
              }
              return { ...w, experience: w.experience + xp };
          }
          return w;
      });

      alert(msg);
      
      if (winner && winner.id !== fighter1 && mob.warriors.find(w => w.id === fighter1)?.type === 'Nob') {
          if (confirm(`Does ${winner.name} take over as Leader?`)) {
              // Swap types logic would go here, simplified for now
          }
      }

      const updatedMob = { ...mob, warriors: updatedWarriors };
      updatedMob.mobRating = calculateMobRating(updatedMob);
      setMob(updatedMob);
      saveMob(updatedMob);
      setPitFightMode(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-zinc-900 p-6 ork-border text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl font-black select-none pointer-events-none">WAAAGH</div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-4xl text-yellow-500 mb-2 font-bangers tracking-wide">{mob.name}</h1>
            <div className="flex gap-4 text-sm font-mono">
              <span className="bg-red-900 px-2 py-1 rounded ork-border shadow-sm border border-red-700">Faction: {mob.faction}</span>
              <span className="bg-blue-900 px-2 py-1 rounded ork-border shadow-sm border border-blue-700">Rating: {mob.mobRating}</span>
              <span className="bg-green-900 px-2 py-1 rounded ork-border shadow-sm border border-green-700">Battles: {mob.battlesFought}</span>
            </div>
          </div>
          <div className="mt-4 md:mt-0 text-right">
            <button onClick={() => setStashMode(!stashMode)} className={`mr-4 px-4 py-2 border ${stashMode ? 'bg-yellow-500 text-black' : 'bg-zinc-800 text-gray-300'}`}>
                {stashMode ? 'CLOSE STASH' : 'OPEN STASH'}
            </button>
            <div className="inline-block">
                <div className="text-sm text-gray-400 uppercase font-bold">Current Teef</div>
                <div className="text-5xl font-black text-yellow-400 drop-shadow-md">{mob.teef}</div>
            </div>
          </div>
        </div>
      </div>

      {stashMode && (
          <div className="bg-zinc-800 p-4 ork-border border-2 border-yellow-600 mb-6">
              <h3 className="text-xl font-black text-yellow-500 mb-2 uppercase">Da Stash</h3>
              <div className="flex flex-wrap gap-2">
                  {mob.stash && mob.stash.length > 0 ? mob.stash.map((item, idx) => (
                      <div key={idx} className="bg-zinc-900 text-white p-2 border border-gray-600 flex items-center gap-2">
                          <span>{item.name}</span>
                          <select 
                            className="bg-black text-xs p-1"
                            onChange={(e) => {
                                if (e.target.value) {
                                    const [type, id] = e.target.value.split(':');
                                    equipFromStash(id, idx, type === 'V');
                                }
                            }}
                            value=""
                          >
                              <option value="">Equip to...</option>
                              <optgroup label="Warriors">
                                {mob.warriors.map(w => <option key={w.id} value={`W:${w.id}`}>{w.name}</option>)}
                              </optgroup>
                              <optgroup label="Vehicles">
                                {mob.vehicles.map(v => <option key={v.id} value={`V:${v.id}`}>{v.name}</option>)}
                              </optgroup>
                          </select>
                      </div>
                  )) : <p className="text-gray-500 italic">Yer stash is empty, ya git.</p>}
              </div>
          </div>
      )}

      {/* Warriors List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center bg-black px-4 py-1 -rotate-1 border-2 border-white inline-block w-full md:w-auto">
            <h2 className="text-2xl text-white font-black">Da Boyz</h2>
            <button onClick={() => setPitFightMode(true)} className="ml-4 text-xs bg-red-700 hover:bg-red-600 px-2 py-1 rounded text-white font-bold">PIT FIGHT!</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mob.warriors.map(warrior => {
            const availableAdvances = getAvailableAdvances(warrior);
            const nextXP = getNextThreshold(warrior.experience);
            const effectiveStats = getEffectiveStats(warrior);
            const warriorValue = getWarriorValue(warrior);

            return (
            <div key={warrior.id} className={`bg-zinc-800 p-4 ork-border relative shadow-lg ${warrior.isInjured ? 'border-red-600' : 'border-black'}`}>
              {warrior.isInjured && <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rotate-3 border border-white">INJURED</div>}
              
              <div className="flex justify-between items-start mb-2 border-b-2 border-zinc-600 pb-2">
                <div>
                  <h3 className="font-black text-xl uppercase text-white leading-none tracking-wide">{warrior.name}</h3>
                  <div className="text-xs font-bold text-yellow-500 uppercase tracking-widest">{warrior.type} <span className="text-gray-500 ml-2">Val: {warriorValue}</span></div>
                </div>
                <div className="flex gap-1">
                    <button 
                        onClick={() => setEditModeId(editModeId === warrior.id ? null : warrior.id)}
                        className={`px-2 rounded font-bold text-xs border ${editModeId === warrior.id ? 'bg-yellow-500 text-black border-yellow-600' : 'bg-zinc-700 text-gray-300 border-zinc-600'}`}
                    >
                        {editModeId === warrior.id ? 'DONE' : 'EDIT'}
                    </button>
                    {availableAdvances > 0 && (
                        <button 
                            onClick={() => setAdvanceWarriorId(warrior.id)}
                            className="bg-blue-600 text-white hover:bg-blue-500 border border-white px-2 rounded font-bold text-xs animate-pulse relative"
                        >
                            LVL UP
                            <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] border border-white">
                                {availableAdvances}
                            </span>
                        </button>
                    )}
                    <button 
                        onClick={() => fireWarrior(warrior.id)} 
                        className="text-red-500 hover:text-white hover:bg-red-600 border border-red-900 px-1 rounded font-bold text-xs transition-colors"
                        title="Remove from Mob"
                    >
                        X
                    </button>
                </div>
              </div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-9 gap-1 text-center text-sm font-bold font-mono mb-3 bg-zinc-900 p-1 border border-zinc-600 text-white">
                {Object.entries(effectiveStats).map(([key, val]) => (
                  <div key={key} className="flex flex-col">
                    <div className="text-xxs text-gray-500 uppercase">{key}</div>
                    {editModeId === warrior.id ? (
                      <input 
                        type="number" 
                        value={warrior.stats[key as keyof StatLine]} 
                        onChange={(e) => handleManualStatChange(warrior.id, key as keyof StatLine, e.target.value)}
                        className="w-full bg-zinc-700 text-center text-white text-xs p-0 border border-zinc-500"
                      />
                    ) : (
                      <span className={val < BASE_STATS[warrior.type][key as keyof StatLine] ? 'text-red-500' : val > BASE_STATS[warrior.type][key as keyof StatLine] ? 'text-green-500' : ''}>
                          {val}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="text-sm space-y-2 text-gray-300">
                <div className="flex justify-between border-b border-zinc-700 pb-1">
                  <span className="text-gray-500 text-xs uppercase">XP (Next: {nextXP})</span>
                  <span className="font-bold text-white">{warrior.experience}</span>
                </div>
                
                <div className="pt-1">
                  <span className="text-xs text-gray-500 font-bold uppercase block mb-1">Gear:</span>
                  <div className="text-xs font-medium leading-snug min-h-[1.5rem] text-gray-200">
                    {warrior.equipment.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                            {warrior.equipment.map((e, idx) => (
                                <span key={idx} className="bg-zinc-700 px-1 rounded border border-zinc-600 flex items-center gap-1 group">
                                    {e.name}
                                    {e.upgrades && e.upgrades.length > 0 && <span className="text-yellow-500"> ({e.upgrades.join(', ')})</span>}
                                    <button onClick={() => unequipToStash(warrior.id, idx)} className="text-gray-500 hover:text-red-400 font-bold ml-1 opacity-0 group-hover:opacity-100 transition-opacity" title="Unequip to Stash">▼</button>
                                </span>
                            ))}
                        </div>
                    ) : <span className="text-gray-600 italic">No equipment</span>}
                  </div>
                </div>

                <div>
                    <span className="text-xs text-gray-500 font-bold uppercase block mb-1">Skills:</span>
                    {warrior.skills.length > 0 ? (
                        <div className="space-y-1">
                            {warrior.skills.map((s, idx) => (
                                <div key={idx} className="text-xs bg-zinc-900 p-1 border-l-2 border-yellow-600 group relative">
                                    <span className="font-bold text-yellow-500">{s.name}:</span> <span className="text-gray-400">{s.description}</span>
                                    {editModeId === warrior.id && (
                                        <button onClick={() => removeSkill(warrior.id, idx)} className="absolute right-0 top-0 text-red-500 font-bold px-1 hover:text-white">x</button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : <span className="text-xs text-gray-600 italic">None</span>}
                </div>

                {warrior.injuries.length > 0 && (
                  <div className="text-red-400 text-xs mt-2 font-bold bg-red-900/20 p-2 border border-red-900 rounded">
                    <span className="uppercase text-red-500 block mb-1">Injuries:</span> 
                    {editModeId === warrior.id ? (
                        <textarea 
                            className="w-full bg-black text-red-400 p-1 text-xs" 
                            value={warrior.injuries.join(',')}
                            onChange={(e) => {
                                const newInjuries = e.target.value.split(',').filter(x => x.trim() !== '');
                                const updated = mob.warriors.map(w => w.id === warrior.id ? {...w, injuries: newInjuries} : w);
                                setMob({...mob, warriors: updated});
                                saveMob({...mob, warriors: updated});
                            }}
                        />
                    ) : (
                        warrior.injuries.join(', ')
                    )}
                  </div>
                )}
              </div>
            </div>
          )})}

          {/* Recruit Card */}
          <div className="bg-zinc-800 p-4 ork-border border-dashed border-gray-600 flex flex-col gap-3 opacity-80 hover:opacity-100 transition-opacity">
            <h3 className="text-gray-400 font-bold text-center uppercase tracking-wider">Recruit New Lad</h3>
            <div className="flex items-center gap-1">
              <input 
                type="text" 
                placeholder="Name" 
                className="w-full p-2 text-sm bg-zinc-900 text-white border border-gray-600 focus:border-yellow-500 focus:outline-none"
                value={recruitName}
                onChange={(e) => setRecruitName(e.target.value)}
              />
              <BrainBoy onNameGenerated={setRecruitName} role={recruitType} />
            </div>
            <select 
              className="w-full p-2 text-sm bg-zinc-900 text-white border border-gray-600 focus:border-yellow-500 focus:outline-none"
              value={recruitType}
              onChange={(e) => setRecruitType(e.target.value as WarriorType)}
            >
              {Object.values(WarriorType).map(t => (
                <option key={t} value={t}>{t} ({BASE_COSTS[t]} Teef)</option>
              ))}
            </select>
            <button 
              onClick={handleRecruitWarrior}
              className="bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-4 ork-border btn-ork mt-auto uppercase tracking-wide shadow-md"
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
            <div key={vehicle.id} className="bg-zinc-800 p-4 ork-border shadow-lg border-2 border-orange-700">
              <div className="flex justify-between items-start border-b-2 border-orange-900 pb-2 mb-2">
                <div>
                  <h3 className="font-black text-xl uppercase text-white tracking-wide">{vehicle.name}</h3>
                  <div className="text-xs font-bold text-orange-500 uppercase">
                    {vehicle.type} <span className="text-gray-500">({vehicle.propulsion})</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-white">Val: {getVehicleValue(vehicle)}</div>
                  <button onClick={() => scrapVehicle(vehicle.id)} className="text-xs text-red-500 hover:text-red-400 hover:underline">Scrap</button>
                </div>
              </div>
              <div className="text-sm text-gray-300">
                <div className="mb-2">
                  <span className="font-bold text-xs uppercase text-gray-500">Upgrades:</span>
                  <div className="text-xs min-h-[1.5em] font-medium text-gray-200">
                    {vehicle.equipment.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                            {vehicle.equipment.map((e, idx) => (
                                <span key={idx} className="bg-zinc-700 px-1 rounded border border-zinc-600 flex items-center gap-1 group">
                                    {e.name}
                                    {e.upgrades && <span className="text-yellow-500"> ({e.upgrades.join(', ')})</span>}
                                    <button onClick={() => unequipToStash(vehicle.id, idx, true)} className="text-gray-500 hover:text-red-400 font-bold ml-1 opacity-0 group-hover:opacity-100 transition-opacity" title="Unequip to Stash">▼</button>
                                </span>
                            ))}
                        </div>
                    ) : <span className="text-gray-600 italic">Stock</span>}
                  </div>
                </div>
                {vehicle.damage.length > 0 && (
                  <div className="text-red-400 text-xs font-bold bg-red-900/20 p-2 border border-red-900 rounded">
                    <span className="uppercase block text-red-500">Permanent Damage:</span>
                    {vehicle.damage.join(', ')}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Buy Vehicle Card */}
          <div className="bg-zinc-800 p-4 ork-border border-dashed border-gray-600 flex flex-col gap-3 opacity-80 hover:opacity-100 transition-opacity">
            <h3 className="text-gray-400 font-bold text-center uppercase tracking-wider">Buy New Wagon</h3>
            <input 
              type="text" 
              placeholder="Vehicle Name" 
              className="w-full p-2 text-sm bg-zinc-900 text-white border border-gray-600 focus:border-yellow-500 focus:outline-none"
              value={vehicleName}
              onChange={(e) => setVehicleName(e.target.value)}
            />
            
            <div className="flex gap-2">
              <select 
                className="w-full p-2 text-sm bg-zinc-900 text-white border border-gray-600 focus:border-yellow-500 focus:outline-none"
                value={vehicleRole}
                onChange={(e) => setVehicleRole(e.target.value as VehicleType)}
              >
                {Object.values(VehicleType).map(t => (
                  <option key={t} value={t}>{t} ({VEHICLE_COSTS[t]} Teef)</option>
                ))}
              </select>

              <select
                className="w-full p-2 text-sm bg-zinc-900 text-white border border-gray-600 focus:border-yellow-500 focus:outline-none"
                value={vehiclePropulsion}
                onChange={(e) => setVehiclePropulsion(e.target.value as 'Wheels' | 'Tracks')}
              >
                <option value="Wheels">Wheels</option>
                <option value="Tracks">Tracks</option>
              </select>
            </div>

            <button 
              onClick={handleBuyVehicle}
              className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-2 px-4 ork-border btn-ork mt-auto uppercase tracking-wide shadow-md"
            >
              BUILD IT ({VEHICLE_COSTS[vehicleRole]} Teef)
            </button>
          </div>
        </div>
      </div>

      {/* Advance Modal */}
      {advanceWarriorId && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-800 p-6 ork-border max-w-md w-full text-white border-2 border-white shadow-2xl">
                <h3 className="text-2xl font-black mb-4 text-yellow-500 uppercase tracking-widest border-b border-gray-600 pb-2">
                    Advance: {mob.warriors.find(w => w.id === advanceWarriorId)?.name}
                </h3>
                
                <div className="flex gap-2 mb-4">
                    <button 
                        className={`flex-1 py-2 font-bold uppercase border ${advanceMode === 'STAT' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-zinc-700 border-zinc-600 text-gray-400'}`}
                        onClick={() => setAdvanceMode('STAT')}
                    >
                        Stat Increase
                    </button>
                    <button 
                        className={`flex-1 py-2 font-bold uppercase border ${advanceMode === 'SKILL' ? 'bg-green-600 border-green-400 text-white' : 'bg-zinc-700 border-zinc-600 text-gray-400'}`}
                        onClick={() => setAdvanceMode('SKILL')}
                    >
                        New Skill
                    </button>
                </div>

                {advanceMode === 'STAT' ? (
                    <div>
                        <p className="mb-2 text-sm text-gray-300">Select which Stat was rolled:</p>
                        <select 
                            value={statChoice} 
                            onChange={(e) => setStatChoice(e.target.value as any)}
                            className="w-full p-3 mb-4 bg-zinc-900 border border-gray-500 text-white font-mono"
                        >
                            <option value="WS">Weapon Skill (+1)</option>
                            <option value="BS">Ballistic Skill (+1)</option>
                            <option value="S">Strength (+1)</option>
                            <option value="T">Toughness (+1)</option>
                            <option value="W">Wounds (+1)</option>
                            <option value="I">Initiative (+1)</option>
                            <option value="A">Attacks (+1)</option>
                            <option value="Ld">Leadership (+1)</option>
                        </select>
                    </div>
                ) : (
                    <div>
                        <p className="mb-2 text-sm text-gray-300">Roll on a table allowed for dis Lad:</p>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            {Object.keys(SKILL_TABLES).map(table => {
                                const warrior = mob.warriors.find(w => w.id === advanceWarriorId);
                                const allowed = warrior && SKILL_ACCESS[warrior.type]?.includes(table);
                                return (
                                    <button
                                        key={table}
                                        onClick={() => { setSkillTable(table); setSelectedSkill(SKILL_TABLES[table][0]); }}
                                        className={`p-2 text-xs font-bold uppercase border ${skillTable === table ? 'bg-yellow-500 text-black border-white' : allowed ? 'bg-zinc-700 text-green-400 border-green-800' : 'bg-zinc-900 text-gray-600 border-zinc-800'}`}
                                    >
                                        {table}
                                    </button>
                                )
                            })}
                        </div>
                        
                        <p className="mb-1 text-sm text-gray-300">Select the Skill rolled:</p>
                        <select
                            className="w-full p-2 bg-zinc-900 border border-gray-500 text-white mb-2 font-mono text-sm"
                            onChange={(e) => {
                                const s = SKILL_TABLES[skillTable].find(s => s.name === e.target.value);
                                if (s) setSelectedSkill(s);
                            }}
                        >
                            {SKILL_TABLES[skillTable].map(s => (
                                <option key={s.name} value={s.name}>{s.name}</option>
                            ))}
                        </select>
                        <div className="bg-black p-2 border border-gray-700 text-xs text-gray-300 min-h-[3em] mb-4">
                            {selectedSkill?.description}
                        </div>
                    </div>
                )}

                <div className="flex gap-4">
                    <button onClick={applyAdvance} className="flex-1 bg-yellow-500 text-black py-3 font-black uppercase tracking-wider ork-border hover:bg-yellow-400 shadow-lg">
                        CONFIRM
                    </button>
                    <button onClick={() => setAdvanceWarriorId(null)} className="flex-1 bg-red-700 text-white py-3 font-black uppercase tracking-wider ork-border hover:bg-red-600 shadow-lg">
                        CANCEL
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Pit Fight Modal */}
      {pitFightMode && (
          <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4">
              <div className="bg-zinc-800 p-6 ork-border max-w-md w-full text-white border-2 border-red-600 shadow-2xl">
                  <h3 className="text-3xl font-black mb-4 text-red-500 uppercase tracking-widest text-center">PIT FIGHT!</h3>
                  <div className="space-y-4 mb-6">
                      <div>
                          <label className="block text-gray-400 text-sm mb-1 uppercase">Fighter 1 (Nob?)</label>
                          <select className="w-full bg-zinc-900 p-2 border border-gray-600 text-white" value={fighter1} onChange={e => setFighter1(e.target.value)}>
                              <option value="">Select Fighter...</option>
                              {mob.warriors.map(w => <option key={w.id} value={w.id}>{w.name} (Ld {w.stats.Ld})</option>)}
                          </select>
                      </div>
                      <div className="text-center font-black text-2xl text-yellow-500">VS</div>
                      <div>
                          <label className="block text-gray-400 text-sm mb-1 uppercase">Fighter 2 (Challenger)</label>
                          <select className="w-full bg-zinc-900 p-2 border border-gray-600 text-white" value={fighter2} onChange={e => setFighter2(e.target.value)}>
                              <option value="">Select Fighter...</option>
                              {mob.warriors.map(w => <option key={w.id} value={w.id}>{w.name} (Ld {w.stats.Ld})</option>)}
                          </select>
                      </div>
                  </div>
                  <div className="flex gap-4">
                      <button onClick={resolvePitFight} className="flex-1 bg-red-600 text-white py-3 font-black uppercase tracking-wider ork-border hover:bg-red-500 shadow-lg">FIGHT!</button>
                      <button onClick={() => setPitFightMode(false)} className="flex-1 bg-zinc-600 text-white py-3 font-black uppercase tracking-wider ork-border hover:bg-zinc-500 shadow-lg">CANCEL</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
