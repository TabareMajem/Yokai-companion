import { 
  CBTActivity, 
  ActivityResult, 
  ExercisePrompt,
  CBTActivityType,
  Difficulty
} from '../types/cbt';
import { CBT_ACTIVITIES } from '../data/cbtActivities';
import { Stats } from '../types/yokai';
import { MemoryManager } from './MemoryManager';

export class CBTActivityManager {
  constructor(
    private currentStats: Stats,
    private memoryManager: MemoryManager,
    private onStatsUpdate: (newStats: Partial<Stats>) => void
  ) {}

  public async generateExercise(prompt: ExercisePrompt): Promise<CBTActivity | null> {
    const availableActivities = this.filterAvailableActivities(
      prompt.type,
      prompt.difficulty
    );

    if (availableActivities.length === 0) {
      return null;
    }

    const recentMemories = await this.memoryManager.queryRelevantMemories(
      prompt.context,
      3
    );

    return this.selectAppropriateActivity(
      availableActivities,
      prompt.userState,
      recentMemories
    );
  }

  public async processActivityResult(
    activity: CBTActivity,
    userResponses: string[]
  ): Promise<ActivityResult> {
    const emotionalStateBefore = this.memoryManager.getShortTermMemory().emotionalState;
    
    const statChanges = this.calculateStatChanges(activity, userResponses);
    await this.onStatsUpdate(statChanges);

    const insights = this.generateInsights(activity, userResponses);
    const emotionalStateAfter = this.determineEmotionalStateAfter(
      emotionalStateBefore,
      statChanges
    );

    await this.memoryManager.storeMemory(
      `Completed CBT activity: ${activity.id}`,
      'interaction',
      {
        activityType: activity.type,
        responses: userResponses,
        insights,
        statChanges
      }
    );

    return {
      completed: true,
      userResponses,
      emotionalState: {
        before: emotionalStateBefore,
        after: emotionalStateAfter
      },
      statChanges,
      insights
    };
  }

  private filterAvailableActivities(
    type: CBTActivityType | undefined,
    difficulty: Difficulty | undefined
  ): CBTActivity[] {
    return CBT_ACTIVITIES.filter(activity => {
      if (type && activity.type !== type) return false;
      if (difficulty && activity.difficulty !== difficulty) return false;
      
      return this.meetsRequirements(activity);
    });
  }

  private meetsRequirements(activity: CBTActivity): boolean {
    for (const [stat, required] of Object.entries(activity.requiredStats)) {
      if ((this.currentStats[stat as keyof Stats] || 0) < required) {
        return false;
      }
    }
    return true;
  }

  private selectAppropriateActivity(
    activities: CBTActivity[],
    userState: ExercisePrompt['userState'],
    recentMemories: any[]
  ): CBTActivity {
    // For now, select randomly from available activities
    // In a real implementation, this would use more sophisticated selection logic
    return activities[Math.floor(Math.random() * activities.length)];
  }

  private calculateStatChanges(
    activity: CBTActivity,
    userResponses: string[]
  ): Partial<Stats> {
    const changes: Partial<Stats> = {};
    
    activity.outcomes.forEach(outcome => {
      changes[outcome.skill] = (changes[outcome.skill] || 0) + outcome.impact;
    });

    // Adjust based on response quality (placeholder logic)
    const responseQualityMultiplier = userResponses.length / activity.instructions.length;
    Object.keys(changes).forEach(key => {
      changes[key as keyof Stats] = 
        Math.round((changes[key as keyof Stats] || 0) * responseQualityMultiplier);
    });

    return changes;
  }

  private generateInsights(
    activity: CBTActivity,
    userResponses: string[]
  ): string[] {
    // Placeholder insight generation
    // In a real implementation, this would use LLM to generate meaningful insights
    return [
      `Completed ${activity.type} exercise`,
      `Followed ${userResponses.length} of ${activity.instructions.length} steps`,
      `Showed engagement with the process`
    ];
  }

  private determineEmotionalStateAfter(
    stateBefore: string,
    changes: Partial<Stats>
  ): string {
    const totalImpact = Object.values(changes).reduce((sum, val) => sum + (val || 0), 0);
    
    if (totalImpact >= 10) return 'very happy';
    if (totalImpact >= 5) return 'happy';
    if (totalImpact >= 0) return 'content';
    if (totalImpact >= -5) return 'tired';
    return 'exhausted';
  }
}