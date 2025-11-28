
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mob, Warrior, GameLog } from '../types';
import { INJURY_TABLE, VEHICLE_DAMAGE_TABLE, PROFIT_TABLE } from '../constants';
import { saveMob, saveLog } from '../services/storageService';
import { generateBattleReport } from '../services/geminiService';

interface PostGameProps {
  mob: Mob;
  setMob: React.Dispatch<React.SetStateAction<Mob | null>>;
}

type Step = 'SETUP' | 'INJURIES' | 'VEHICLE_DAMAGE' | 'INCOME' | 'SUMMARY';

export const PostGame: React.FC<PostGameProps> = ({ mob, setMob }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('SETUP');
  const [opponent, setOpponent] = useState('');
  const [outcome, setOutcome] = useState<'Win' | 'Loss' | 'Draw'>('Win');
  
  const [participants, setParticipants] = useState<Set<string>>(new Set());
  const [bonusXP, setBonusXP] = useState<Record<string, number>>({});

  const [oosIds, setOosIds] = useState<Set<string>>(new Set()); 
  const [injuriesLog, setInjuriesLog] = useState<Record<string, { roll: number, result: string }>>({});
  
  // Vehicle Damage State
  const [wreckedIds, setWreckedIds] = useState<Set<string>>(new Set());
  const [vehicleDamageLog, setVehicleDamageLog] = useState<Record<string, { roll: number, result: string }>>({});

  const [grossIncome, setGrossIncome] = useState(0);
  const [extraTeef, setExtraTeef] = useState(0); 
  const [finalProfit, setFinalProfit] = useState(0);
  
  const [report, setReport] = useState('');
  const [generatingReport, setGeneratingReport] = useState(false);

  const toggleParticipant = (id: string) => {
    const newSet = new Set(participants);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setParticipants(newSet);
  };

  const handleBonusXPChange = (id: string, val: string) => {
    const num = parseInt(val) || 0;
    setBonusXP(prev => ({...prev, [id]: num}));
  };

  const toggleOos = (id: string) => {
    const newSet = new Set(oosIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setOosIds(newSet);
  };

  const toggleWrecked = (id: string) => {
    const newSet = new Set(wreckedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setWreckedIds(newSet);
  };

  const rollDice = (d: number) => Math.floor(Math.random() * d) + 1;

  const resolveInjuries = () => {
    const newInjuriesLog: Record<string, { roll: number, result: string }> = {};
    
    mob.warriors.forEach(w => {
      if (oosIds.has(w.id)) {
        const d66 = parseInt(`${rollDice(6)}${rollDice(6)}`);
        const entry = INJURY_TABLE.find(e => e.range.includes(d66));
        const result = entry ? entry.result : 'Full Recovery';
        newInjuriesLog[w.id] = { roll: d66, result };
      }
    });

    setInjuriesLog(newInjuriesLog);
    setStep('VEHICLE_DAMAGE');
  };

  const resolveVehicleDamage = () => {
    const newLog: Record<string, { roll: number, result: string }> = {};
    
    mob.vehicles.forEach(v => {
      if (wreckedIds.has(v.id)) {
        const d66 = parseInt(`${rollDice(6)}${rollDice(6)}`);
        const entry = VEHICLE_DAMAGE_TABLE.find(e => e.range.includes(d66));
        const result = entry ? entry.result : 'Fixed';
        newLog[v.id] = { roll: d66, result };
      }
    });

    setVehicleDamageLog(newLog);
    setStep('INCOME');
  };

  const dokReroll = (warriorId: string) => {
    if (!confirm("Use Da Dok to fix dis lad? (Reroll injury)")) return;
    const d66 = parseInt(`${rollDice(6)}${rollDice(6)}`);
    const entry = INJURY_TABLE.find(e => e.range.includes(d66));
    const result = entry ? entry.result : 'Full Recovery';
    setInjuriesLog(prev => ({ ...prev, [warriorId]: { roll: d66, result } }));
  };

  const calculateIncome = () => {
    // 1. Calculate Gross Income (Mining + Extra)
    let miningIncome = 0;
    mob.warriors.forEach(w => {
      if (!oosIds.has(w.id) && !w.isInjured && (w.type === 'Boy' || w.type === 'Grot')) {
        miningIncome += (w.type === 'Boy' ? rollDice(6) : Math.ceil(rollDice(6)/2)); // Grots/Yoofs usually D3
      }
    });

    const totalGross = miningIncome + extraTeef;
    setGrossIncome(totalGross);

    // 2. Determine Mob Size
    // Count Warriors + Vehicles + Special Characters (usually count as 2, simplistic count for now)
    const mobSize = mob.warriors.length + mob.vehicles.length;

    // 3. Consult Profit Table
    // Columns map: 1-3 (0), 4-6 (1), 7-9 (2), 10-12 (3), 13-15 (4), 16-18 (5), 19+ (6)
    let sizeIndex = 0;
    if (mobSize >= 19) sizeIndex = 6;
    else if (mobSize >= 16) sizeIndex = 5;
    else if (mobSize >= 13) sizeIndex = 4;
    else if (mobSize >= 10) sizeIndex = 3;
    else if (mobSize >= 7) sizeIndex = 2;
    else if (mobSize >= 4) sizeIndex = 1;
    else sizeIndex = 0;

    // Find row
    const row = PROFIT_TABLE.find(r => totalGross <= r.incomeMax) || PROFIT_TABLE[PROFIT_TABLE.length - 1];
    const actualProfit = row.profits[sizeIndex];

    setFinalProfit(actualProfit);
    setStep('SUMMARY');
  };

  const finalizeGame = async () => {
    const deadIds: string[] = [];
    const destroyedVehicleIds: string[] = [];
    
    // Update Warriors
    const updatedWarriors = mob.warriors.map(w => {
        let warrior = { ...w, isInjured: false }; 
        
        // Handle Injuries
        if (injuriesLog[w.id]) {
            const { result } = injuriesLog[w.id];
            if (result === 'Dead') {
                deadIds.push(w.id);
            } else if (result === 'Full Recovery') {
                warrior.isInjured = true;
            } else if (result === 'Captured') {
                // Logic for capture is complex, just mark injured for now
                warrior.isInjured = true; 
            } else {
                warrior.injuries = [...warrior.injuries, result];
            }
        }

        // Handle XP
        if (participants.has(w.id)) {
            let xpGain = rollDice(6); // Participation D6
            if (w.id === mob.warriors.find(m => m.type === 'Nob')?.id && outcome === 'Win') {
                xpGain += 10;
            }
            if (bonusXP[w.id]) {
                xpGain += bonusXP[w.id];
            }
            warrior.experience += xpGain;
        }
        return warrior;
    }).filter(w => !deadIds.includes(w.id));

    // Update Vehicles
    const updatedVehicles = mob.vehicles.map(v => {
        let vehicle = { ...v };
        if (vehicleDamageLog[v.id]) {
            const { result } = vehicleDamageLog[v.id];
            if (result === 'Destroyed') {
                destroyedVehicleIds.push(v.id);
            } else if (result !== 'Fixed') {
                vehicle.damage = [...vehicle.damage, result];
            }
        }
        return vehicle;
    }).filter(v => !destroyedVehicleIds.includes(v.id));

    // Update Mob
    const updatedMob = {
      ...mob,
      teef: mob.teef + finalProfit,
      battlesFought: mob.battlesFought + 1,
      warriors: updatedWarriors,
      vehicles: updatedVehicles
    };

    // Generate Report (async but don't block navigation too long)
    setGeneratingReport(true);
    let flavorText = "Battle logged.";
    try {
        flavorText = await generateBattleReport(mob.name, opponent || 'Some Gits', outcome);
    } catch(e) { console.error(e); }
    setReport(flavorText);
    setGeneratingReport(false);

    // Save
    setMob(updatedMob);
    saveMob(updatedMob);

    const log: GameLog = {
      id: crypto.randomUUID(),
      scenario: 'Skirmish',
      opponent: opponent || 'Unknown',
      outcome,
      income: finalProfit,
      date: new Date().toLocaleDateString(),
      notes: flavorText
    };
    saveLog(log);

    // Redirect to Home
    navigate('/');
  };

  if (step === 'SETUP') {
    return (
      <div className="bg-zinc-800 p-6 ork-border text-white">
        <h2 className="text-3xl font-black mb-6 text-yellow-500 uppercase tracking-widest">Post Game Sequence</h2>
        
        <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
                <label className="block text-sm font-bold mb-1 uppercase text-gray-400">Opponent Mob Name</label>
                <input 
                    className="w-full p-2 bg-white text-black font-bold border-2 border-gray-600 focus:border-yellow-500 focus:outline-none" 
                    value={opponent} 
                    onChange={e => setOpponent(e.target.value)} 
                    placeholder="Da Enemy"
                />
            </div>
            <div>
                <label className="block text-sm font-bold mb-1 uppercase text-gray-400">Outcome</label>
                <div className="flex gap-2">
                    {['Win', 'Loss', 'Draw'].map(o => (
                    <button
                        key={o}
                        onClick={() => setOutcome(o as any)}
                        className={`flex-1 py-2 font-black uppercase border-2 transition-all ${outcome === o ? 'bg-green-600 border-green-400 text-white' : 'bg-zinc-700 border-zinc-600 text-gray-400'}`}
                    >
                        {o}
                    </button>
                    ))}
                </div>
            </div>
        </div>

        <h3 className="text-xl font-black mb-2 text-white border-b border-gray-600 pb-2">Participation & Bonus XP</h3>
        <div className="space-y-2 mb-8">
          {mob.warriors.map(w => (
            <div key={w.id} className="flex items-center justify-between bg-zinc-700 p-2 border border-zinc-600">
              <div className="flex items-center">
                <input 
                    type="checkbox" 
                    checked={participants.has(w.id)} 
                    onChange={() => toggleParticipant(w.id)}
                    className="w-6 h-6 mr-3 accent-yellow-500 cursor-pointer"
                />
                <span className="font-bold text-gray-200">{w.name} <span className="text-xs text-gray-400 font-normal">({w.type})</span></span>
              </div>
              
              {participants.has(w.id) && (
                  <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-400 uppercase font-bold">Bonus XP:</label>
                      <input 
                        type="number" 
                        min="0"
                        className="w-16 p-1 text-black text-center font-bold"
                        value={bonusXP[w.id] || 0}
                        onChange={(e) => handleBonusXPChange(w.id, e.target.value)}
                      />
                  </div>
              )}
            </div>
          ))}
        </div>

        <button onClick={() => setStep('INJURIES')} className="w-full py-4 bg-red-600 font-black text-2xl uppercase tracking-widest ork-border hover:bg-red-500 btn-ork text-white shadow-[4px_4px_0_#000]">
          NEXT: OO'Z HURT?
        </button>
      </div>
    );
  }

  if (step === 'INJURIES') {
    return (
      <div className="bg-zinc-800 p-6 ork-border text-white">
        <h2 className="text-3xl font-black mb-4 text-red-500 uppercase">Casualties</h2>
        <p className="mb-4 text-gray-300 font-medium">Select warriors who went <span className="text-red-400 font-bold">Out of Action</span>.</p>
        
        <div className="space-y-2 mb-8">
          {mob.warriors.filter(w => participants.has(w.id)).map(w => (
            <div key={w.id} className={`flex items-center p-3 border-2 transition-colors cursor-pointer ${oosIds.has(w.id) ? 'bg-red-900/50 border-red-500' : 'bg-zinc-700 border-zinc-600'}`} onClick={() => toggleOos(w.id)}>
              <input 
                type="checkbox" 
                checked={oosIds.has(w.id)} 
                readOnly
                className="w-6 h-6 mr-3 accent-red-600 pointer-events-none"
              />
              <span className={`font-bold text-lg ${oosIds.has(w.id) ? 'text-red-200' : 'text-gray-300'}`}>{w.name}</span>
            </div>
          ))}
        </div>

        <button onClick={resolveInjuries} className="w-full py-4 bg-yellow-600 font-black text-2xl uppercase tracking-widest ork-border hover:bg-yellow-500 btn-ork text-black shadow-[4px_4px_0_#000]">
          ROLL DA BONES (Injuries)
        </button>
      </div>
    );
  }

  if (step === 'VEHICLE_DAMAGE') {
      return (
        <div className="bg-zinc-800 p-6 ork-border text-white">
            <h2 className="text-3xl font-black mb-4 text-orange-500 uppercase">Wrecked Wagons</h2>
            <p className="mb-4 text-gray-300 font-medium">Select vehicles that were <span className="text-orange-400 font-bold">Wrecked</span>.</p>
            
            <div className="space-y-2 mb-8">
            {mob.vehicles.map(v => (
                <div key={v.id} className={`flex items-center p-3 border-2 transition-colors cursor-pointer ${wreckedIds.has(v.id) ? 'bg-orange-900/50 border-orange-500' : 'bg-zinc-700 border-zinc-600'}`} onClick={() => toggleWrecked(v.id)}>
                <input 
                    type="checkbox" 
                    checked={wreckedIds.has(v.id)} 
                    readOnly
                    className="w-6 h-6 mr-3 accent-orange-600 pointer-events-none"
                />
                <span className={`font-bold text-lg ${wreckedIds.has(v.id) ? 'text-orange-200' : 'text-gray-300'}`}>{v.name}</span>
                </div>
            ))}
            </div>

            <button onClick={resolveVehicleDamage} className="w-full py-4 bg-yellow-600 font-black text-2xl uppercase tracking-widest ork-border hover:bg-yellow-500 btn-ork text-black shadow-[4px_4px_0_#000]">
            ROLL DAMAGE
            </button>
        </div>
      );
  }

  if (step === 'INCOME') {
    return (
      <div className="bg-zinc-800 p-6 ork-border text-white">
        <h2 className="text-3xl font-black mb-4 uppercase text-white">Results</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-zinc-900 p-4 border-2 border-zinc-600">
                <h3 className="font-black text-xl text-yellow-500 mb-2 uppercase">Injuries</h3>
                {Object.keys(injuriesLog).length === 0 ? <p className="text-gray-500 italic">None.</p> : (
                    <div className="space-y-2">
                    {Object.entries(injuriesLog).map(([id, injury]) => {
                        const warrior = mob.warriors.find(w => w.id === id);
                        return (
                            <div key={id} className="flex justify-between items-center bg-zinc-800 p-2 border border-zinc-700">
                                <div><span className="font-bold text-red-400">{warrior?.name}</span> <span className="text-xs text-gray-400">({injury.roll} - {injury.result})</span></div>
                                <button onClick={() => dokReroll(id)} className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-2 py-1 uppercase border border-blue-400">Dok</button>
                            </div>
                        );
                    })}
                    </div>
                )}
            </div>
            <div className="bg-zinc-900 p-4 border-2 border-zinc-600">
                <h3 className="font-black text-xl text-orange-500 mb-2 uppercase">Vehicle Damage</h3>
                {Object.keys(vehicleDamageLog).length === 0 ? <p className="text-gray-500 italic">None.</p> : (
                    <div className="space-y-2">
                    {Object.entries(vehicleDamageLog).map(([id, dmg]) => {
                        const v = mob.vehicles.find(v => v.id === id);
                        return (
                            <div key={id} className="bg-zinc-800 p-2 border border-zinc-700">
                                <span className="font-bold text-orange-400">{v?.name}</span> <span className="text-xs text-gray-400">({dmg.roll} - {dmg.result})</span>
                            </div>
                        );
                    })}
                    </div>
                )}
            </div>
        </div>

        <div className="mb-8">
            <label className="block font-bold text-gray-300 mb-1 uppercase">Extra Teef (Scrap, Scenario Rewards)</label>
            <input 
                type="number"
                min="0"
                className="w-full p-3 text-xl font-bold bg-white text-black border-2 border-yellow-600 focus:outline-none"
                value={extraTeef}
                onChange={(e) => setExtraTeef(parseInt(e.target.value) || 0)}
            />
        </div>

        <button onClick={calculateIncome} className="w-full py-4 bg-green-600 font-black text-2xl uppercase tracking-widest ork-border hover:bg-green-500 btn-ork text-white shadow-[4px_4px_0_#000]">
          CALCULATE PROFIT
        </button>
      </div>
    );
  }

  return (
    <div className="bg-zinc-800 p-6 ork-border text-white text-center">
      <h2 className="text-5xl font-black text-yellow-400 mb-6 drop-shadow-md font-bangers tracking-widest">GAME OVER!</h2>
      
      <div className="bg-zinc-900 p-6 border-2 border-zinc-600 mb-8 max-w-md mx-auto">
          <div className="flex justify-between mb-2">
              <span className="text-gray-400 font-bold uppercase">Gross Income</span>
              <span className="text-xl font-bold">{grossIncome}</span>
          </div>
          <div className="flex justify-between mb-4 border-b border-gray-600 pb-4">
              <span className="text-gray-400 font-bold uppercase">Mob Size</span>
              <span className="text-xl font-bold">{mob.warriors.length + mob.vehicles.length}</span>
          </div>
          <div className="flex justify-between items-center">
              <span className="text-yellow-500 font-black uppercase text-xl">Profit (Teef Kept)</span>
              <span className="text-4xl font-black text-green-400">{finalProfit}</span>
          </div>
      </div>

      <button 
        onClick={finalizeGame} 
        disabled={generatingReport}
        className="px-8 py-4 bg-blue-600 font-black text-xl ork-border hover:bg-blue-500 btn-ork disabled:opacity-50 text-white shadow-[4px_4px_0_#000] w-full uppercase"
      >
        {generatingReport ? 'WRITIN\' IN DA BOOK...' : 'FINISH & SAVE'}
      </button>
    </div>
  );
};
