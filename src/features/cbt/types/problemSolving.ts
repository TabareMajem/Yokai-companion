import { CBTActivity } from './index';

export interface ProblemSolvingStep {
  phase: 'define' | 'generate' | 'evaluate' | 'implement' | 'review';
  prompts: string[];
  guidance: string;
  completionCriteria: string[];
}

export interface Solution {
  description: string;
  pros: string[];
  cons: string[];
  feasibility: number;
}

export interface Problem {
  description: string;
  impact: string[];
  barriers: string[];
}

export interface ProblemSolvingExercise extends CBTActivity {
  problem: Problem;
  steps: ProblemSolvingStep[];
  solutions: Solution[];
}

export interface UserContext {
  emotionalState: string;
  availableSupport: string[];
  pastCopingStrategies: string[];
  resources: string[];
  recentProgress?: {
    completedExercises: number;
    successRate: number;
  };
}