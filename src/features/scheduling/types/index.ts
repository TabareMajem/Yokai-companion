import { Stats } from '../../../types/yokai';

export type ActivityType = 'pleasure' | 'mastery' | 'social' | 'self-care';

export interface TimeRange {
  start: number; // Hour in 24-hour format
  end: number;
}

export interface TimeCommitment {
  id: string;
  name: string;
  timeSlot: TimeRange;
  daysOfWeek: number[]; // 0-6, where 0 is Sunday
  priority: number; // 1-3, where 1 is highest priority
}

export interface ScheduledActivity {
  id: string;
  type: ActivityType;
  name: string;
  description: string;
  timeSlot: {
    preferredTime: TimeRange;
    duration: number; // in minutes
    flexibility: number; // 1-3, where 1 is most flexible
  };
  preparation: string[];
  barriers: string[];
  solutions: string[];
  accountability: string[];
  requiredStats: Partial<Stats>;
  rewards: {
    wisdom?: number;
    empathy?: number;
    energy?: number;
    happiness?: number;
    relationshipPoints?: number;
  };
}

export interface UserPreferences {
  preferredTimes: {
    [key in ActivityType]: TimeRange[];
  };
  energyLevels: {
    [key: number]: number; // Hour -> Energy level (0-100)
  };
  availableDays: number[];
  supportSystem: string[];
  limitations: string[];
}

export interface SchedulingResult {
  activities: ScheduledActivity[];
  timeSlots: {
    [key: string]: TimeRange; // ActivityId -> TimeRange
  };
  conflicts: string[];
  suggestions: string[];
}