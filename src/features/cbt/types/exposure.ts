import { CBTActivity } from './index';

export interface ExposureStep {
  situation: string;
  anticipatedAnxiety: number; // 0-100
  duration: number; // in minutes
  supports: string[];
  copingStrategies: string[];
}

export interface ExposureHierarchy {
  target: string;
  steps: ExposureStep[];
  progressionRules: {
    successCriteria: string[];
    advancementThreshold: number;
    setbackHandling: string[];
  };
  safetyGuidelines: string[];
}

export interface ExposureActivity extends CBTActivity {
  hierarchy: ExposureHierarchy;
  currentStepIndex: number;
  completedSteps: number[];
  anxietyRatings: Record<number, number>;
}

export interface ExposureContext {
  currentAnxiety: number;
  previousExposures: string[];
  availableSupport: string[];
  preferredCopingStrategies: string[];
  environmentalFactors: string[];
}