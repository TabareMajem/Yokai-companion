import { CBTActivity } from '../types/cbt';

export const CBT_ACTIVITIES: CBTActivity[] = [
  {
    id: 'thought-journal',
    type: 'ThoughtRestructuring',
    difficulty: 1,
    duration: 10,
    objective: 'Identify and challenge negative thought patterns',
    instructions: [
      'Write down a troubling thought or situation',
      'Identify the emotions you feel',
      'List evidence for and against this thought',
      'Create a balanced perspective'
    ],
    requiredStats: {
      wisdom: 10,
      empathy: 5
    },
    outcomes: [
      { skill: 'wisdom', impact: 3 },
      { skill: 'empathy', impact: 2 }
    ]
  },
  {
    id: 'mindful-breathing',
    type: 'MindfulnessExercise',
    difficulty: 1,
    duration: 5,
    objective: 'Develop present-moment awareness through breath focus',
    instructions: [
      'Find a comfortable position',
      'Focus on your natural breath',
      'Notice when your mind wanders',
      'Gently return focus to breathing'
    ],
    requiredStats: {
      energy: 20
    },
    outcomes: [
      { skill: 'wisdom', impact: 2 },
      { skill: 'energy', impact: 5 },
      { skill: 'happiness', impact: 3 }
    ]
  },
  {
    id: 'emotion-regulation',
    type: 'EmotionalRegulation',
    difficulty: 2,
    duration: 15,
    objective: 'Learn to manage and understand emotional responses',
    instructions: [
      'Identify current emotional state',
      'Rate intensity of emotions',
      'Apply coping strategies',
      'Reflect on effectiveness'
    ],
    requiredStats: {
      wisdom: 20,
      empathy: 15
    },
    outcomes: [
      { skill: 'empathy', impact: 4 },
      { skill: 'happiness', impact: 3 }
    ]
  }
];