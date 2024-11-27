import { Activity } from '../types/interaction';

export const ACTIVITIES: Activity[] = [
  {
    id: 'play-catch',
    type: 'play',
    name: 'Play Catch',
    description: 'A fun game of catch that builds coordination and trust.',
    duration: 10,
    energyCost: 2,
    rewards: {
      happiness: 3,
      empathy: 1,
      relationshipPoints: 2,
    },
  },
  {
    id: 'meditation',
    type: 'learn',
    name: 'Meditation Session',
    description: 'A peaceful meditation session to develop mindfulness.',
    duration: 15,
    energyCost: 1,
    rewards: {
      wisdom: 3,
      empathy: 2,
      happiness: 1,
      relationshipPoints: 1,
    },
  },
  {
    id: 'spirit-food',
    type: 'feed',
    name: 'Spirit Food',
    description: 'Nourishing spiritual food that restores energy.',
    duration: 5,
    energyCost: 0,
    rewards: {
      energy: 5,
      happiness: 2,
      relationshipPoints: 1,
    },
  },
  {
    id: 'peaceful-rest',
    type: 'rest',
    name: 'Peaceful Rest',
    description: 'A period of peaceful rest to recover energy.',
    duration: 30,
    energyCost: 0,
    rewards: {
      energy: 10,
      happiness: 1,
    },
  },
];