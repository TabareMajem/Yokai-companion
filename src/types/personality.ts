import { Stats } from './yokai';

export interface CulturalElement {
  type: 'symbol' | 'story' | 'value';
  name: string;
  description: string;
}

export interface PersonalityTrait {
  id: string;
  name: string;
  description: string;
  evolutionStage: number;
  culturalElements: CulturalElement[];
  statBonuses?: Partial<Stats>;
}

export interface PersonalityResponse {
  content: string;
  tone: string;
  culturalReferences: string[];
}