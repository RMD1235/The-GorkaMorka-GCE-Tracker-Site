import { Mob, GameLog } from '../types';

const MOB_KEY = 'gorkamorka_mob';
const LOGS_KEY = 'gorkamorka_logs';

export const getMob = (): Mob | null => {
  const data = localStorage.getItem(MOB_KEY);
  return data ? JSON.parse(data) : null;
};

export const saveMob = (mob: Mob): void => {
  localStorage.setItem(MOB_KEY, JSON.stringify(mob));
};

export const getLogs = (): GameLog[] => {
  const data = localStorage.getItem(LOGS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveLog = (log: GameLog): void => {
  const logs = getLogs();
  logs.unshift(log);
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
};

export const clearData = (): void => {
  localStorage.removeItem(MOB_KEY);
  localStorage.removeItem(LOGS_KEY);
};