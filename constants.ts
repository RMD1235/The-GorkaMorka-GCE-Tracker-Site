
import { StatLine, WarriorType, Item, VehicleType } from './types';

export const BASE_STATS: Record<WarriorType, StatLine> = {
  [WarriorType.NOB]: { M: 4, WS: 4, BS: 4, S: 3, T: 4, W: 1, I: 3, A: 1, Ld: 7 },
  [WarriorType.SPANNER]: { M: 4, WS: 3, BS: 3, S: 3, T: 4, W: 1, I: 2, A: 1, Ld: 7 },
  [WarriorType.SLAVER]: { M: 4, WS: 3, BS: 3, S: 3, T: 4, W: 1, I: 2, A: 1, Ld: 7 },
  [WarriorType.BOY]: { M: 4, WS: 3, BS: 3, S: 3, T: 4, W: 1, I: 2, A: 1, Ld: 7 },
  [WarriorType.YOOF]: { M: 4, WS: 2, BS: 2, S: 3, T: 3, W: 1, I: 2, A: 1, Ld: 6 },
  [WarriorType.GROT]: { M: 4, WS: 2, BS: 3, S: 3, T: 3, W: 1, I: 2, A: 1, Ld: 5 },
};

export const BASE_COSTS: Record<WarriorType, number> = {
  [WarriorType.NOB]: 12,
  [WarriorType.SPANNER]: 6,
  [WarriorType.SLAVER]: 6,
  [WarriorType.BOY]: 5,
  [WarriorType.YOOF]: 3,
  [WarriorType.GROT]: 2,
};

// Starting XP: Base + D6 (handled in logic)
export const STARTING_XP_BASE: Record<WarriorType, number> = {
  [WarriorType.NOB]: 60,
  [WarriorType.SPANNER]: 60,
  [WarriorType.SLAVER]: 20,
  [WarriorType.BOY]: 20,
  [WarriorType.YOOF]: 0,
  [WarriorType.GROT]: 20, // Often 0 or 20 depending on house rules, sticking to book which usually implies basic xp for troops
};

export const VEHICLE_COSTS: Record<VehicleType, number> = {
  [VehicleType.TRANSPORT]: 20,
  [VehicleType.SUPPORT]: 15,
  [VehicleType.BIKE]: 10,
};

export const SHOP_ITEMS: Item[] = [
  // Hand-to-Hand
  { id: 'knife', name: 'Knife', cost: 0, type: 'Hand-to-Hand' },
  { id: 'knuckles', name: 'Knuckledusters', cost: 0, type: 'Hand-to-Hand' },
  { id: 'chain', name: 'Chain/Flail', cost: 1, type: 'Hand-to-Hand' },
  { id: 'club', name: 'Club/Choppa', cost: 1, type: 'Hand-to-Hand' },
  { id: 'spear', name: 'Spear', cost: 1, type: 'Hand-to-Hand' },
  { id: 'uge_choppa', name: '\'Uge Choppa', cost: 2, type: 'Hand-to-Hand', notes: 'Two-handed' },
  
  // Gunz
  { id: 'slugga', name: 'Slugga', cost: 2, type: 'Gunz', notes: 'Pistol' },
  { id: 'sixshoota', name: 'Six-Shoota', cost: 2, type: 'Gunz', notes: 'Pistol' },
  { id: 'blunderbuss', name: 'Blunderbuss', cost: 1, type: 'Gunz' },
  { id: 'bow', name: 'Bow', cost: 1, type: 'Gunz' },
  { id: 'crossbow', name: 'Crossbow', cost: 1, type: 'Gunz' },
  { id: 'shoota', name: 'Shoota', cost: 2, type: 'Gunz' },
  { id: 'kannon_hand', name: 'Kannon', cost: 3, type: 'Gunz' },

  // Stikkbombz
  { id: 'frag', name: 'Frag Stikkbombz', cost: 3, type: 'Stikkbombz' },
  { id: 'krak', name: 'Krak Stikkbombz', cost: 5, type: 'Stikkbombz' },

  // Armour
  { id: 'shield', name: 'Shield', cost: 1, type: 'Armor' },
  { id: 'studded', name: 'Studded Armour', cost: 4, type: 'Armor' },
  { id: 'flak', name: 'Flak Armour', cost: 4, type: 'Armor' }, 
  { id: 'eavy', name: '\'Eavy Armour', cost: 9, type: 'Armor' },

  // Slaver Stuff
  { id: 'grabba', name: 'Grabba Stik', cost: 2, type: 'Slaver' },
  { id: 'whip', name: 'Whip', cost: 2, type: 'Slaver' },

  // Vehicle Weapons (Fixed)
  { id: 'v_h_kannon', name: 'Harpoon Gun', cost: 7, type: 'Vehicle Weapon' },
  { id: 'v_skorcha', name: 'Skorcha', cost: 8, type: 'Vehicle Weapon' },
  { id: 'v_spear', name: 'Spear Gun', cost: 9, type: 'Vehicle Weapon' },
  { id: 'v_rokkit', name: 'Rokkit Launcher', cost: 13, type: 'Vehicle Weapon' },
  { id: 'v_eavy_shoota', name: '\'Eavy Shoota', cost: 15, type: 'Vehicle Weapon' },
  { id: 'v_linked_shoota', name: 'Twin-Linked Shoota', cost: 4, type: 'Vehicle Weapon' },

  // Gubbinz
  { id: 'plank', name: 'Boarding Plank', cost: 3, type: 'Gubbinz' },
  { id: 'plates', name: 'Extra Armour Plates', cost: 4, type: 'Gubbinz' },
  { id: 'spikes', name: 'Spikes', cost: 5, type: 'Gubbinz' },
  { id: 'ram', name: 'Reinforced Ram', cost: 5, type: 'Gubbinz' },
  { id: 'big_grabber', name: 'Big Grabber', cost: 5, type: 'Gubbinz' },
  { id: 'wrecker', name: 'Wrecker Ball', cost: 10, type: 'Gubbinz' },
];

export const INJURY_TABLE = [
  { range: [11, 12, 13, 14, 15, 16], result: 'Dead', desc: 'The warrior is lost.' },
  { range: [21, 22, 23], result: 'Multiple Injuries', desc: 'Roll D6 times on this table.' },
  { range: [24, 25, 26], result: 'Leg Wound', desc: '-1 Move' },
  { range: [31, 32, 33], result: 'Arm Wound', desc: '-1 Strength' },
  { range: [34, 35, 36], result: 'Head Wound', desc: 'Frenzy or Stupidity on 4+' },
  { range: [41, 42, 43], result: 'Chest Wound', desc: '-1 Toughness' },
  { range: [44, 45, 46], result: 'Blinded in One Eye', desc: '-1 BS' },
  { range: [51, 52, 53, 54, 55, 56], result: 'Full Recovery', desc: 'Misses next game.' },
  { range: [61, 62, 63], result: 'Captured', desc: 'Captured by enemy mob.' },
  { range: [64, 65, 66], result: 'Bitter Enmity', desc: 'Hates the enemy.' },
];

export const VEHICLE_DAMAGE_TABLE = [
  { range: [11, 12, 13], result: 'Destroyed', desc: 'Vehicle is scrap.' },
  { range: [14, 15, 16], result: 'Badly Mangled', desc: 'Roll D6 on sub-table.' },
  { range: [21, 22], result: 'Armour Weakened', desc: '-1 Armour all locations.' },
  { range: [23], result: 'Bent Chassis', desc: '-1 to Thrust tests.' },
  { range: [24], result: 'Fixer Upper', desc: 'Misses next battle.' },
  { range: [25, 26], result: 'Steering Jams', desc: 'Strength check to turn.' },
  { range: [31, 32], result: 'Boneshaker', desc: '-1 to Hit when shooting.' },
  { range: [33, 34], result: 'Annoying Squeak', desc: '-1 Ld on driving tests.' },
  { range: [35, 36], result: 'Unreliable', desc: 'Roll D6 before game, 1 = can\'t use.' },
  { range: [41, 42, 43, 44, 45, 46, 51, 52, 53, 54, 55, 56], result: 'Fixed', desc: 'Counts as full recovery.' },
  { range: [61, 62, 63], result: 'Captured', desc: 'Taken by enemy.' },
  { range: [64, 65], result: 'Ard Looking', desc: '+1 Ld to passengers.' },
  { range: [66], result: 'Improved', desc: 'All permanent damage fixed.' },
];

// Profit Table: Income vs Mob Size
// Rows are income ranges, Cols are mob size buckets (1-3, 4-6, 7-9, 10-12, 13-15, 16-18, 19+)
export const PROFIT_TABLE = [
  { incomeMax: 2,  profits: [3, 3, 2, 2, 1, 1, 0] },
  { incomeMax: 5,  profits: [5, 4, 3, 3, 2, 1, 1] },
  { incomeMax: 8,  profits: [7, 6, 5, 4, 3, 2, 2] },
  { incomeMax: 12, profits: [9, 8, 7, 6, 5, 4, 3] },
  { incomeMax: 17, profits: [11, 10, 9, 8, 7, 5, 4] },
  { incomeMax: 23, profits: [13, 11, 10, 9, 8, 6, 5] },
  { incomeMax: 30, profits: [15, 13, 12, 10, 9, 7, 6] },
  { incomeMax: 38, profits: [16, 15, 14, 12, 10, 8, 7] },
  { incomeMax: 47, profits: [17, 16, 15, 13, 12, 10, 9] },
  { incomeMax: 57, profits: [18, 17, 16, 14, 13, 11, 10] },
  { incomeMax: 999, profits: [19, 18, 17, 15, 14, 12, 11] }, // 58+
];

export const XP_BRACKETS = [0, 6, 11, 21, 31, 41, 51, 61, 81, 101, 121, 141, 161, 181, 201, 241, 281, 321, 361, 401];
