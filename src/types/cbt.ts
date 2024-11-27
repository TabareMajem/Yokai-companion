import { Stats } from './yokai';

export type CBTActivityType = 
  | 'ThoughtRestructuring'
  | 'MindfulnessExercise'
  | 'BehavioralActivation'
  | 'RelaxationTechnique'
  | 'EmotionalRegulation'
  | 'ProblemSolving';

export type Difficulty = 1 | 2 | 3;

export interface CBTActivity {
  id: string;
  type: CBTActivityType;
  difficulty: Difficulty;
  duration: number;
  objective: string;
  instructions: string[];
  requiredStats: Partial<Stats>;
  outcomes: {
    skill: keyof Stats;
    impact: number;
  }[];
}

export interface ActivityResult {
  completed: boolean;
  userResponses: string[];
  emotionalState: {
    before: string;
    after: string;
  };
  statChanges: Partial<Stats>;
  insights: string[];
}

export interface ExercisePrompt {
  context: string;
  type: CBTActivityType;
  userState: {
    currentMood: string;
    recentProgress: Partial<Stats>;
    previousExercises: string[];
  };
  difficulty: Difficulty;
}