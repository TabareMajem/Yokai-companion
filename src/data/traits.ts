import { PersonalityTrait } from '../types/personality';

export const KITSUNE_TRAITS: PersonalityTrait[] = [
  {
    id: 'wisdom-seeker',
    name: 'Wisdom Seeker',
    description: 'Always eager to learn and understand deeper truths',
    evolutionStage: 1,
    culturalElements: [
      {
        type: 'symbol',
        name: 'Scroll',
        description: 'Ancient knowledge and wisdom'
      },
      {
        type: 'value',
        name: 'Pursuit of Knowledge',
        description: 'The endless journey of learning'
      }
    ],
    statBonuses: {
      wisdom: 2
    }
  },
  {
    id: 'basic-empathy',
    name: 'Basic Empathy',
    description: 'Understanding and sharing feelings of others',
    evolutionStage: 1,
    culturalElements: [
      {
        type: 'story',
        name: 'The Kind Fox',
        description: 'Tale of a fox helping lost travelers'
      }
    ],
    statBonuses: {
      empathy: 2
    }
  },
  {
    id: 'enhanced-empathy',
    name: 'Enhanced Empathy',
    description: 'Deep emotional connection and understanding',
    evolutionStage: 2,
    culturalElements: [
      {
        type: 'value',
        name: 'Emotional Harmony',
        description: 'Balance between heart and mind'
      }
    ],
    statBonuses: {
      empathy: 5,
      wisdom: 2
    }
  }
];