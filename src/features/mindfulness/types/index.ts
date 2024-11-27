import { CBTActivity } from '../../cbt/types';

export type MindfulnessFocus = 'breath' | 'body' | 'thoughts' | 'emotions' | 'senses';

export interface MindfulnessExercise extends CBTActivity {
  focus: MindfulnessFocus;
  structure: {
    introduction: string;
    mainPractice: string[];
    closure: string;
  };
  guidance: {
    posture: string;
    attention: string;
    breathing: string;
    difficulties: string[];
  };
  adaptations: {
    shorter: string;
    longer: string;
    difficult: string;
  };
}

export interface MindfulnessState {
  currentFocus: MindfulnessFocus;
  timeElapsed: number;
  distractions: number;
  emotionalState: string;
  insights: string[];
}

export interface MindfulnessContext {
  previousSessions: number;
  averageDuration: number;
  preferredFocus: MindfulnessFocus[];
  challengeAreas: string[];
  environmentalFactors: string[];
}