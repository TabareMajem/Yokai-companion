import { Stats } from '../../../types/yokai';

export interface Activity {
  id: string;
  name: string;
  description: string;
  category: 'pleasure' | 'mastery' | 'social' | 'self-care';
  difficulty: 1 | 2 | 3;
  duration: number; // in minutes
  energyRequired: number;
  rewards: {
    pleasure: number;
    mastery: number;
    connection: number;
    stats: Partial<Stats>;
  };
  preparation: string[];
  barriers: string[];
  solutions: string[];
}

export interface ActivitySchedule {
  activities: Activity[];
  timeSlots: {
    [key: string]: {
      startTime: string;
      endTime: string;
    };
  };
  energyDistribution: number[];
  dailyGoals: {
    pleasure: number;
    mastery: number;
    connection: number;
  };
}

export interface ActivityProgress {
  completed: boolean;
  enjoyment: number;
  mastery: number;
  notes: string;
  barriers: string[];
  solutions: string[];
  timestamp: Date;
}

export interface UserPreferences {
  preferredTimes: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
  };
  energyPattern: {
    [hour: number]: number;
  };
  interests: string[];
  limitations: string[];
  supportSystem: string[];
}