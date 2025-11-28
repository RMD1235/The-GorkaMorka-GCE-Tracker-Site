
import { StatLine, WarriorType, Item, VehicleType, Skill } from './types';

export const BASE_STATS: Record<WarriorType, StatLine> = {
  [WarriorType.NOB]: { M: 4, WS: 4, BS: 4, S: 3, T: 4, W: 1, I: 3, A: 1, Ld: 7 },
  [WarriorType.SPANNER]: { M: 4, WS: 3, BS: 3, S: 3, T: 4, W: 1, I: 2, A: 1, Ld: 7 },
  [WarriorType.SLAVER]: { M: 4, WS: 3, BS: 3, S: 3, T: 4, W: 1, I: 2, A: 1, Ld: 7 },
  [WarriorType.BOY]: { M: 4, WS: 3, BS: 3, S: 3, T: 4, W: 1, I: 2, A: 1, Ld: 7 },
  [WarriorType.YOOF]: { M: 4, WS: 2, BS: 2, S: 3, T: 3, W: 1, I: 2, A: 1, Ld: 6 },
  [WarriorType.GROT]: { M: 4, WS: 2, BS: 3, S: 3, T: 3, W: 1, I: 2, A: 1, Ld: 5 },
};

export const MAX_STATS: Record<string, StatLine> = {
  'ORK': { M: 4, WS: 6, BS: 6, S: 4, T: 5, W: 3, I: 5, A: 3, Ld: 9 },
  'GROT': { M: 4, WS: 3, BS: 4, S: 3, T: 3, W: 1, I: 3, A: 1, Ld: 6 },
};

export const BASE_COSTS: Record<WarriorType, number> = {
  [WarriorType.NOB]: 12,
  [WarriorType.SPANNER]: 6,
  [WarriorType.SLAVER]: 6,
  [WarriorType.BOY]: 5,
  [WarriorType.YOOF]: 3,
  [WarriorType.GROT]: 2,
};

export const STARTING_XP_BASE: Record<WarriorType, number> = {
  [WarriorType.NOB]: 60,
  [WarriorType.SPANNER]: 60,
  [WarriorType.SLAVER]: 20,
  [WarriorType.BOY]: 20,
  [WarriorType.YOOF]: 0,
  [WarriorType.GROT]: 20,
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
  { id: 'studded', name: 'Studded Armour', cost: 1, type: 'Armor' },
  { id: 'flak', name: 'Flak Armour', cost: 2, type: 'Armor' },
  { id: 'eavy', name: '\'Eavy Armour', cost: 7, type: 'Armor' },

  // Slaver Stuff
  { id: 'grabba', name: 'Grabba Stik', cost: 2, type: 'Slaver' },
  { id: 'whip', name: 'Whip', cost: 2, type: 'Slaver' },
  { id: 'net', name: 'Net', cost: 2, type: 'Slaver' },
  { id: 'bolas', name: 'Bolas', cost: 1, type: 'Slaver' },

  // Vehicle Weapons (Fixed)
  { id: 'v_h_kannon', name: 'Harpoon Gun', cost: 7, type: 'Vehicle Weapon' },
  { id: 'v_skorcha', name: 'Skorcha', cost: 8, type: 'Vehicle Weapon' },
  { id: 'v_spear', name: 'Spear Gun', cost: 9, type: 'Vehicle Weapon' },
  { id: 'v_rokkit', name: 'Rokkit Launcher', cost: 13, type: 'Vehicle Weapon' },
  { id: 'v_eavy_shoota', name: '\'Eavy Shoota', cost: 15, type: 'Vehicle Weapon' },
  { id: 'v_linked_shoota', name: 'Twin-Linked Shoota', cost: 4, type: 'Vehicle Weapon' },
  { id: 'v_linked_kannon', name: 'Twin-Linked Kannon', cost: 6, type: 'Vehicle Weapon' },

  // Gubbinz
  { id: 'plank', name: 'Boarding Plank', cost: 3, type: 'Gubbinz' },
  { id: 'plates', name: 'Extra Armour Plates', cost: 4, type: 'Gubbinz' },
  { id: 'spikes', name: 'Spikes', cost: 5, type: 'Gubbinz' },
  { id: 'ram', name: 'Reinforced Ram', cost: 5, type: 'Gubbinz' },
  { id: 'big_grabber', name: 'Big Grabber', cost: 5, type: 'Gubbinz' },
  { id: 'wrecker', name: 'Wrecker Ball', cost: 10, type: 'Gubbinz' },
  // Loadsa Ammo is handled dynamically in UI
];

export const SKILL_TABLES: Record<string, Skill[]> = {
  'Muscle': [
    { name: 'Right In Da Groin!', description: 'Criticals count as +2 instead of +1.', table: 'Muscle' },
    { name: '\'Ard as Nails', description: 'Treat Injury rolls of 1-3 as Flesh Wound.', table: 'Muscle' },
    { name: 'Krumpa', description: '+2 S in HtH if using only knives/knuckles.', table: 'Muscle' },
    { name: '\'Eadbutt', description: 'Charge causes Stupidity on opponent.', table: 'Muscle' },
    { name: 'Lobba', description: '+2" throw range, -2" scatter.', table: 'Muscle' },
    { name: 'Thick Skull', description: 'Reduce Strength of hits by 1 in HtH.', table: 'Muscle' },
  ],
  'Ferocity': [
    { name: 'Waaagh!', description: 'Double attacks on charge (no parry).', table: 'Ferocity' },
    { name: 'Headlong Leap', description: 'Ignore obstacles on charge, +1 I to board.', table: 'Ferocity' },
    { name: 'Flying Tackle', description: '+2 Combat Score bonus for charging.', table: 'Ferocity' },
    { name: 'Windmillin\'', description: 'Always win draws in HtH.', table: 'Ferocity' },
    { name: 'Gotcha!', description: 'Can jump off vehicle to attack enemies.', table: 'Ferocity' },
    { name: 'Play Chicken', description: 'Can board a vehicle trying to squash you.', table: 'Ferocity' },
  ],
  'Driving': [
    { name: 'Chase Driver', description: 'Reroll failed Ld tests when chasing.', table: 'Driving' },
    { name: 'Skid Start', description: 'Can use slow speed maneuvers before moving.', table: 'Driving' },
    { name: 'Fixer', description: 'Roll twice on perm damage table once per game.', table: 'Driving' },
    { name: 'Stunt Driver', description: 'Choose swerve direction, reroll spins.', table: 'Driving' },
    { name: 'Emergency Stop', description: 'Avoid crashes by passing Ld test.', table: 'Driving' },
    { name: 'Ded Canny', description: '+1 Ld for driving tests.', table: 'Driving' },
  ],
  'Cunnin\'': [
    { name: 'Supa Sneaky', description: 'Deploy after all other models.', table: 'Cunnin\'' },
    { name: 'Wrecka', description: 'Can cling to vehicle outside and attack.', table: 'Cunnin\'' },
    { name: 'Dodgy Git', description: '6+ unmodifiable save.', table: 'Cunnin\'' },
    { name: 'Duck \'N\' Weave', description: '-1 to be hit by shooting.', table: 'Cunnin\'' },
    { name: 'Play Dead', description: 'Cannot be attacked while Down.', table: 'Cunnin\'' },
    { name: 'Sneak Off', description: 'Captured result counts as Full Recovery.', table: 'Cunnin\'' },
  ],
  'Dakka': [
    { name: 'Kool', description: 'Can shoot any target in range, not just closest.', table: 'Dakka' },
    { name: 'Hipshoota', description: 'Shoot even if ran/thrusting.', table: 'Dakka' },
    { name: 'Dakka Dakka!', description: 'Reroll one Sustained Fire Dice.', table: 'Dakka' },
    { name: 'Bomma', description: 'Ignore first ammo roll for grenades.', table: 'Dakka' },
    { name: 'Rapid Fire', description: 'Shoot twice if stationary.', table: 'Dakka' },
    { name: 'Deadeye', description: 'Reroll to wound dice.', table: 'Dakka' },
  ],
  'Odd': [
    { name: 'Dok', description: 'Can reroll injury table results for others.', table: 'Odd' },
    { name: 'Loota', description: 'Adds D6 to income if not OOA.', table: 'Odd' },
    { name: 'Taktiks', description: 'Allies within 6" reroll failed Ld.', table: 'Odd' },
    { name: 'Brewboy', description: 'Allow ally to reroll Old Battle Wound test.', table: 'Odd' },
    { name: 'Gunboy', description: 'Ignore failed ammo rolls on 4+.', table: 'Odd' },
    { name: 'Rizin\' Star', description: 'Reroll future advance rolls.', table: 'Odd' },
  ]
};

export const SKILL_ACCESS: Record<WarriorType, string[]> = {
  [WarriorType.NOB]: ['Muscle', 'Ferocity', 'Driving', 'Cunnin\'', 'Dakka', 'Odd'],
  [WarriorType.SPANNER]: ['Muscle', 'Driving', 'Dakka', 'Odd'],
  [WarriorType.SLAVER]: ['Muscle', 'Ferocity', 'Cunnin\'', 'Dakka'],
  [WarriorType.BOY]: ['Muscle', 'Ferocity', 'Dakka'],
  [WarriorType.YOOF]: ['Muscle', 'Ferocity'],
  [WarriorType.GROT]: ['Cunnin\''],
};

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

// Dok Serjery Tables
export const IZ_IT_SAFE_TABLE = [
  { roll: 1, title: 'Dis Is A New Technique', desc: 'Oops. Serjery messed up. Still pay D6 teef.', outcome: 'Bodge' },
  { roll: 2, title: 'Da Patient is Restin', desc: 'Success but unconscious. Miss next game. Pay D6 teef.', outcome: 'Success_Miss' },
  { roll: 3, title: 'Klose enuff!', desc: 'Wrong body part! Roll on random other table. Pay D6 teef.', outcome: 'Random_Table' },
  { roll: 4, title: 'Rooteen Serjery', desc: 'Success! Pay D6 teef.', outcome: 'Success' },
  { roll: 5, title: 'Rooteen Serjery', desc: 'Success! Pay D6 teef.', outcome: 'Success' },
  { roll: 6, title: 'Profeshunnal!', desc: 'Success! Pay D6 teef. No side effects.', outcome: 'Success' },
];

// Maps injury names to table keys
export const INJURY_TO_TABLE_MAP: Record<string, string> = {
  'Arm Wound': 'ARM',
  'Leg Wound': 'LEG',
  'Head Wound': 'HEAD',
  'Blinded in One Eye': 'EYE',
  'Chest Wound': 'CHEST',
  'Old Battle Wound': 'CHEST'
};

export const SERJERY_TABLES: Record<string, Item[]> = {
  'ARM': [
    { id: 'b_hook', name: 'Hook Arm', cost: 0, type: 'Equipment', notes: '-1 WS, no 2-handed weapons' },
    { id: 'b_kutta', name: 'Kutta Arm', cost: 0, type: 'Equipment', notes: 'Counts as Choppa, no 2-handed' },
    { id: 'b_telescopic_arm', name: 'Telescopic Arm', cost: 0, type: 'Equipment', notes: '+1 I in HtH, Pushback' },
    { id: 'b_shoota_arm', name: 'Shoota Arm', cost: 0, type: 'Equipment', notes: 'Built-in Shoota' },
    { id: 'b_grapple', name: 'Grapple Arm', cost: 0, type: 'Equipment', notes: 'Range 8", S3 Hit, Drag' },
    { id: 'b_klaw', name: 'Klaw Arm', cost: 0, type: 'Equipment', notes: 'Sx2, -3 Save, D2, 1-handed' },
  ],
  'LEG': [
    { id: 'b_peg', name: 'Peg Leg', cost: 0, type: 'Equipment', notes: '-1 Move' },
    { id: 'b_leg', name: 'Bionik Leg', cost: 0, type: 'Equipment', notes: 'Normal movement' },
    { id: 'b_kick', name: 'De-Lux Kicking Leg', cost: 0, type: 'Equipment', notes: '+1 Attack' },
    { id: 'b_tele_leg', name: 'Telescopic Legs', cost: 0, type: 'Equipment', notes: 'See over obstacles, +D6" Run/Charge' },
    { id: 'b_wheel', name: 'Gyro-Stabilised Monowheel', cost: 0, type: 'Equipment', notes: '+2 Move, Cannot climb' },
    { id: 'b_trak', name: 'Traks/Wheels', cost: 0, type: 'Equipment', notes: 'Counts as Vehicle for movement' },
  ],
  'HEAD': [
    { id: 'b_squig', name: 'Squig Brain Transplant', cost: 0, type: 'Equipment', notes: 'Halve stats, random squig effect' },
    { id: 'b_staples', name: 'Staples & Glue', cost: 0, type: 'Equipment', notes: 'Cured, no bonus' },
    { id: 'b_horns', name: 'Steel Horns', cost: 0, type: 'Equipment', notes: '+1 Attack on Charge' },
    { id: 'b_skull', name: 'Steel Skull', cost: 0, type: 'Equipment', notes: '+1 Ld' },
    { id: 'b_boom', name: 'Explosive Kranium', cost: 0, type: 'Equipment', notes: 'Explodes if OOA' },
    { id: 'b_mask', name: 'Iron Mask', cost: 0, type: 'Equipment', notes: 'Causes Fear' },
  ],
  'EYE': [
    { id: 'b_squig_eye', name: 'Squig Eye', cost: 0, type: 'Equipment', notes: 'Still -1 BS' },
    { id: 'b_spare', name: 'Spare Parts', cost: 0, type: 'Equipment', notes: 'Normal vision' },
    { id: 'b_tele_eye', name: 'Telescopic Eye', cost: 0, type: 'Equipment', notes: '+1 Hit > 18"' },
    { id: 'b_peri', name: 'Periscope', cost: 0, type: 'Equipment', notes: 'See around corners' },
    { id: 'b_eye', name: 'Bionik Eye', cost: 0, type: 'Equipment', notes: '+1 Hit all shooting' },
    { id: 'b_auto', name: 'Auto Senses', cost: 0, type: 'Equipment', notes: '+1 Hit, see through smoke' },
  ],
  'CHEST': [
    { id: 'b_lung', name: 'Iron Lung', cost: 0, type: 'Equipment', notes: '-1 Move on Run/Charge' },
    { id: 'b_boosta', name: 'Kustom Thrusta Boosta', cost: 0, type: 'Equipment', notes: 'Thrust like vehicle once per game' },
    { id: 'b_breath', name: 'Fungus Bref Lungs', cost: 0, type: 'Equipment', notes: '-1 Enemy WS in HtH' },
    { id: 'b_fuel', name: 'Fuel Injection Implant', cost: 0, type: 'Equipment', notes: '+2 M/I on 2+, else Down' },
    { id: 'b_plate', name: 'Armour Plating', cost: 0, type: 'Equipment', notes: '+1 T' },
    { id: 'b_cybork', name: 'Cybork Body', cost: 0, type: 'Equipment', notes: 'Av 9 instead of T/W' },
  ]
};

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
  { incomeMax: 999, profits: [19, 18, 17, 15, 14, 12, 11] },
];

export const XP_BRACKETS = [0, 6, 11, 21, 31, 41, 51, 61, 81, 101, 121, 141, 161, 181, 201, 241, 281, 321, 361, 401];
