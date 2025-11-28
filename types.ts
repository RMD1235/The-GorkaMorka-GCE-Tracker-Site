
export enum WarriorType {
  NOB = 'Nob',
  SPANNER = 'Spanner',
  SLAVER = 'Slaver',
  BOY = 'Boy',
  YOOF = 'Yoof',
  GROT = 'Grot'
}

export enum VehicleType {
  TRANSPORT = 'Transport',
  SUPPORT = 'Support',
  BIKE = 'Bike'
}

export interface StatLine {
  M: number;
  WS: number;
  BS: number;
  S: number;
  T: number;
  W: number;
  I: number;
  A: number;
  Ld: number;
}

export interface Item {
  id: string;
  name: string;
  cost: number;
  type: 'Weapon' | 'Armor' | 'Equipment' | 'VehicleUpgrade' | 'Hand-to-Hand' | 'Gunz' | 'Stikkbombz' | 'Slaver' | 'Vehicle Weapon' | 'Gubbinz';
  notes?: string;
}

export interface Warrior {
  id: string;
  name: string;
  type: WarriorType;
  stats: StatLine;
  cost: number;
  experience: number;
  equipment: Item[];
  injuries: string[];
  isInjured: boolean; // Misses next game
}

export interface Vehicle {
  id: string;
  name: string;
  type: VehicleType;
  propulsion: 'Wheels' | 'Tracks';
  cost: number;
  equipment: Item[]; // Gubbins, Fixed Weapons
  driverId?: string;
  gunnerId?: string;
  damage: string[]; // Permanent damage strings
}

export interface Mob {
  id: string;
  name: string;
  faction: 'Gorkers' | 'Morkers' | 'Diggas' | 'Rebel Grots';
  teef: number;
  warriors: Warrior[];
  vehicles: Vehicle[];
  battlesFought: number;
  mobRating: number;
}

export interface GameLog {
  id: string;
  scenario: string;
  opponent: string;
  outcome: 'Win' | 'Loss' | 'Draw';
  income: number;
  date: string;
  notes: string;
}
