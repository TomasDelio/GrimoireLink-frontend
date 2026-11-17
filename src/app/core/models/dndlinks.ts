//como devuelve de la dndapi

export interface DndReference {
  index: string;
  name: string;
  url: string;
}

export interface DndReferenceList {
  count: number;
  results: DndReference[];
}

export interface DndRule {
  index: string;
  name: string;
  subsections: DndReference[];
}

export interface DndAbilityScore {
  index: string;
  name: string;
  full_name: string;
  skills: DndReference[];
}

export interface DndRace {
  index: string;
  name: string;
  speed: number;
  size: string;
  ability_bonuses: { ability_score: DndReference; bonus: number }[];
}

export interface DndClass {
  index: string;
  name: string;
  hit_die: number;
  saving_throws: DndReference[];
}

export interface DndMonster {
  index: string;
  name: string;
  size: string;
  type: string;
  alignment: string;
  armor_class: { type: string; value: number }[];
  hit_points: number;
  challenge_rating: number;
  image?: string;
}

export interface DndSpell {
  index: string;
  name: string;
  level: number;
  desc: string[];
  range: string;
  casting_time: string;
  school: DndReference;
}