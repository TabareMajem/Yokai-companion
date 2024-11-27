import { Activity, InteractionResult } from '../types/interaction';
import { Memory } from '../types/memory';
import { ActivityManager } from './ActivityManager';
import { MemoryManager } from './MemoryManager';
import { Stats } from '../types/yokai';

export class InteractionManager {
  constructor(
    private activityManager: ActivityManager,
    private memoryManager: MemoryManager,
    private onStatsUpdate: (stats: Partial<Stats>) => void,
    private onRelationshipUpdate: (points: number) => void
  ) {}

  public async handleInteraction(activity: Activity): Promise<InteractionResult> {
    try {
      const result = await this.activityManager.performActivity(activity);

      if (result.success) {
        await this.processSuccessfulInteraction(activity, result);
      }

      return result;
    } catch (error) {
      console.error('Error during interaction:', error);
      return {
        success: false,
        message: 'Something went wrong during the interaction.',
        statChanges: {},
      };
    }
  }

  private async processSuccessfulInteraction(
    activity: Activity,
    result: InteractionResult
  ): Promise<void> {
    // Store interaction memory
    await this.memoryManager.storeMemory(
      `Performed ${activity.name}`,
      'interaction',
      {
        activityType: activity.type,
        statChanges: result.statChanges,
      },
      activity.type === 'learn' ? 2 : 1 // Learning activities are more important
    );

    // Store emotional memory if there are significant stat changes
    if (this.hasSignificantStatChanges(result.statChanges)) {
      await this.memoryManager.storeMemory(
        `Had a meaningful experience during ${activity.name}`,
        'emotion',
        {
          emotion: this.determineEmotionalImpact(result.statChanges),
          statChanges: result.statChanges,
        },
        2
      );
    }

    // Update emotional state based on activity outcome
    this.memoryManager.setEmotionalState(
      this.determineEmotionalImpact(result.statChanges)
    );
  }

  private hasSignificantStatChanges(changes: InteractionResult['statChanges']): boolean {
    const threshold = 5;
    return Object.values(changes).some(value => Math.abs(value || 0) >= threshold);
  }

  private determineEmotionalImpact(changes: InteractionResult['statChanges']): string {
    const totalImpact = Object.values(changes).reduce((sum, value) => sum + (value || 0), 0);
    
    if (totalImpact >= 10) return 'very happy';
    if (totalImpact >= 5) return 'happy';
    if (totalImpact >= 0) return 'content';
    if (totalImpact >= -5) return 'tired';
    return 'exhausted';
  }
}