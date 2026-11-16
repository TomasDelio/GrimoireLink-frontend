import { Monster } from './monster';

export interface Encounter {
  publicId: string;
  encounterType: string;
  encounterDifficulty: string;
  description: string;
  encounterStatus: string;
  monsters: Monster[];
}
