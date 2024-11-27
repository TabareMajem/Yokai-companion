import { CBTActivity, ActivityResult } from '../types/cbt';
import { MemoryManager } from './MemoryManager';
import { Stats } from '../types/yokai';

export class RealTimeExerciseManager {
  private currentExercise: CBTActivity | null = null;
  private progressTimer: number | null = null;
  private exerciseStatus: {
    startTime: number;
    currentStep: number;
    responses: string[];
    timePerStep: number[];
  } | null = null;

  constructor(
    private memoryManager: MemoryManager,
    private onStatsUpdate: (stats: Partial<Stats>) => void
  ) {}

  public async startExercise(activity: CBTActivity): Promise<void> {
    this.currentExercise = activity;
    this.exerciseStatus = {
      startTime: Date.now(),
      currentStep: 0,
      responses: [],
      timePerStep: []
    };

    this.startProgressTracking();
    
    await this.memoryManager.storeMemory(
      `Started ${activity.type} exercise`,
      'interaction',
      {
        activityType: activity.type,
        difficulty: activity.difficulty,
        startTime: this.exerciseStatus.startTime
      }
    );
  }

  public async recordResponse(response: string): Promise<void> {
    if (!this.exerciseStatus || !this.currentExercise) {
      throw new Error('No active exercise');
    }

    const stepDuration = Date.now() - (
      this.exerciseStatus.startTime + 
      this.exerciseStatus.timePerStep.reduce((a, b) => a + b, 0)
    );

    this.exerciseStatus.responses.push(response);
    this.exerciseStatus.timePerStep.push(stepDuration);
    this.exerciseStatus.currentStep++;

    if (this.exerciseStatus.currentStep >= this.currentExercise.instructions.length) {
      return this.completeExercise();
    }
  }

  public getCurrentProgress(): number {
    if (!this.exerciseStatus || !this.currentExercise) return 0;

    return Math.min(
      100,
      Math.round(
        (this.exerciseStatus.currentStep / this.currentExercise.instructions.length) * 100
      )
    );
  }

  public getTimeSpent(): number {
    if (!this.exerciseStatus) return 0;
    return Date.now() - this.exerciseStatus.startTime;
  }

  private startProgressTracking(): void {
    if (this.progressTimer) {
      window.clearInterval(this.progressTimer);
    }

    this.progressTimer = window.setInterval(() => {
      this.checkTimeLimit();
    }, 1000);
  }

  private async checkTimeLimit(): Promise<void> {
    if (!this.exerciseStatus || !this.currentExercise) return;

    const timeSpent = this.getTimeSpent();
    const timeLimit = this.currentExercise.duration * 60 * 1000; // Convert minutes to ms

    if (timeSpent >= timeLimit) {
      await this.completeExercise(true);
    }
  }

  private async completeExercise(timedOut: boolean = false): Promise<void> {
    if (!this.exerciseStatus || !this.currentExercise) {
      throw new Error('No active exercise');
    }

    const emotionalStateBefore = this.memoryManager.getShortTermMemory().emotionalState;
    const completionQuality = this.calculateCompletionQuality();
    const statChanges = this.calculateStatChanges(completionQuality);

    await this.onStatsUpdate(statChanges);

    const result: ActivityResult = {
      completed: !timedOut,
      userResponses: this.exerciseStatus.responses,
      emotionalState: {
        before: emotionalStateBefore,
        after: this.determineEmotionalStateAfter(statChanges)
      },
      statChanges,
      insights: this.generateInsights(completionQuality, timedOut)
    };

    await this.memoryManager.storeMemory(
      `Completed ${this.currentExercise.type} exercise`,
      'interaction',
      {
        activityType: this.currentExercise.type,
        quality: completionQuality,
        timedOut,
        duration: this.getTimeSpent(),
        statChanges
      }
    );

    this.cleanup();
    return result;
  }

  private cleanup(): void {
    if (this.progressTimer) {
      window.clearInterval(this.progressTimer);
      this.progressTimer = null;
    }

    this.currentExercise = null;
    this.exerciseStatus = null;
  }

  private calculateCompletionQuality(): number {
    if (!this.exerciseStatus || !this.currentExercise) return 0;

    const responseQuality = this.exerciseStatus.responses.reduce((quality, response) => {
      return quality + Math.min(response.length / 50, 1); // Simple length-based quality
    }, 0) / this.currentExercise.instructions.length;

    const timeQuality = Math.min(
      this.getTimeSpent() / (this.currentExercise.duration * 60 * 1000),
      1
    );

    return (responseQuality * 0.7 + timeQuality * 0.3) * 100;
  }

  private calculateStatChanges(quality: number): Partial<Stats> {
    if (!this.currentExercise) return {};

    const multiplier = quality / 100;
    const changes: Partial<Stats> = {};

    this.currentExercise.outcomes.forEach(outcome => {
      const impact = Math.round(outcome.impact * multiplier);
      changes[outcome.skill] = (changes[outcome.skill] || 0) + impact;
    });

    return changes;
  }

  private generateInsights(quality: number, timedOut: boolean): string[] {
    const insights: string[] = [];

    if (timedOut) {
      insights.push('Exercise was not completed within the time limit');
    }

    if (quality >= 90) {
      insights.push('Showed exceptional engagement and thoughtfulness');
    } else if (quality >= 70) {
      insights.push('Demonstrated good understanding and effort');
    } else if (quality >= 50) {
      insights.push('Completed the exercise with moderate engagement');
    } else {
      insights.push('Could benefit from more detailed responses');
    }

    if (this.exerciseStatus?.timePerStep.length) {
      const avgTime = this.exerciseStatus.timePerStep.reduce((a, b) => a + b, 0) / 
                     this.exerciseStatus.timePerStep.length;
      
      if (avgTime < 30000) { // Less than 30 seconds per step
        insights.push('Consider taking more time to reflect on each step');
      } else if (avgTime > 120000) { // More than 2 minutes per step
        insights.push('Shows deep reflection and consideration');
      }
    }

    return insights;
  }

  private determineEmotionalStateAfter(changes: Partial<Stats>): string {
    const totalImpact = Object.values(changes).reduce((sum, val) => sum + (val || 0), 0);
    
    if (totalImpact >= 10) return 'very happy';
    if (totalImpact >= 5) return 'happy';
    if (totalImpact >= 0) return 'content';
    if (totalImpact >= -5) return 'tired';
    return 'exhausted';
  }
}