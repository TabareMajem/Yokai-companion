export type EvolutionStage = 1 | 2 | 3;

export interface VisualAppearance {
  primaryColor: string;
  secondaryColor: string;
  pattern: string;
  size: number;
  aura: string;
}

export interface Stats {
  wisdom: number;
  empathy: number;
  energy: number;
  happiness: number;
}

export interface Trait {
  id: string;
  name: string;
  description: string;
  category: 'emotional' | 'behavioral' | 'spiritual';
  unlockRequirements?: Partial<Stats>;
}

export interface YokaiProfile {
  id: string;
  name: string;
  evolutionStage: EvolutionStage;
  relationshipLevel: number;
  traits: Trait[];
  stats: Stats;
  appearance: VisualAppearance;
  createdAt: Date;
  lastInteraction: Date;
}