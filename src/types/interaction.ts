export type ActivityType = 'play' | 'learn' | 'feed' | 'rest';

export interface Activity {
  id: string;
  type: ActivityType;
  name: string;
  description: string;
  duration: number; // in minutes
  energyCost: number;
  rewards: {
    wisdom?: number;
    empathy?: number;
    energy?: number;
    happiness?: number;
    relationshipPoints?: number;
  };
}

export interface InteractionResult {
  success: boolean;
  message: string;
  statChanges: {
    wisdom?: number;
    empathy?: number;
    energy?: number;
    happiness?: number;
    relationshipPoints?: number;
  };
  memories?: string[];
}