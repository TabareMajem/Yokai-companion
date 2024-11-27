import { Stats } from '../../../types/yokai';

export type Emotion = 
  | 'joy'
  | 'sadness'
  | 'anger'
  | 'fear'
  | 'surprise'
  | 'contentment'
  | 'anxiety'
  | 'excitement';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export interface MoodEntry {
  id: string;
  timestamp: Date;
  primary: Emotion;
  secondary: Emotion[];
  intensity: number; // 1-10
  triggers: string[];
  context: {
    location: string;
    activity: string;
    socialContext: string[];
    weather?: string;
  };
  notes: string;
}

export interface EmotionalPattern {
  emotion: Emotion;
  frequency: number;
  averageIntensity: number;
  commonTriggers: string[];
  timeDistribution: Record<TimeOfDay, number>;
}

export interface EmotionalTrend {
  startDate: Date;
  endDate: Date;
  dominantEmotions: Array<{
    emotion: Emotion;
    percentage: number;
  }>;
  intensityTrend: 'increasing' | 'decreasing' | 'stable';
  triggers: Array<{
    trigger: string;
    frequency: number;
    associatedEmotions: Emotion[];
  }>;
}

export interface MoodAnalysis {
  patterns: EmotionalPattern[];
  triggers: Array<{
    trigger: string;
    impact: number;
    emotions: Emotion[];
  }>;
  recommendations: string[];
}

export interface TherapeuticResponse {
  content: string;
  type: 'validation' | 'support' | 'guidance' | 'reframe';
  suggestedActivities: string[];
  copingStrategies: string[];
}