import { Activity, ActivityType, InteractionResult } from '../types/interaction';
import { Stats } from '../types/yokai';
import { formatDistance } from 'date-fns';

export class ActivityManager {
  private lastActivityTime: Record<ActivityType, Date> = {
    play: new Date(0),
    learn: new Date(0),
    feed: new Date(0),
    rest: new Date(0),
  };

  constructor(
    private currentStats: Stats,
    private onStatsUpdate: (newStats: Partial<Stats>) => void,
    private onRelationshipUpdate: (points: number) => void
  ) {}

  public async performActivity(activity: Activity): Promise<InteractionResult> {
    if (!this.canPerformActivity(activity)) {
      const cooldown = this.getRemainingCooldown(activity.type);
      return {
        success: false,
        message: `Cannot perform ${activity.name} yet. Please wait ${cooldown}.`,
        statChanges: {},
      };
    }

    if (!this.hasEnoughEnergy(activity)) {
      return {
        success: false,
        message: `Not enough energy to perform ${activity.name}. Try resting first!`,
        statChanges: {},
      };
    }

    const result = await this.processActivity(activity);
    this.lastActivityTime[activity.type] = new Date();
    
    return result;
  }

  private canPerformActivity(activity: Activity): boolean {
    const lastTime = this.lastActivityTime[activity.type];
    const cooldownTime = this.getCooldownTime(activity.type);
    return Date.now() - lastTime.getTime() >= cooldownTime;
  }

  private getRemainingCooldown(type: ActivityType): string {
    const lastTime = this.lastActivityTime[type];
    const cooldownTime = this.getCooldownTime(type);
    const remainingTime = cooldownTime - (Date.now() - lastTime.getTime());
    
    return formatDistance(new Date(), new Date(Date.now() + remainingTime), { 
      addSuffix: true 
    });
  }

  private getCooldownTime(type: ActivityType): number {
    const cooldowns: Record<ActivityType, number> = {
      play: 5 * 60 * 1000, // 5 minutes
      learn: 15 * 60 * 1000, // 15 minutes
      feed: 30 * 60 * 1000, // 30 minutes
      rest: 60 * 60 * 1000, // 1 hour
    };
    return cooldowns[type];
  }

  private hasEnoughEnergy(activity: Activity): boolean {
    return this.currentStats.energy >= activity.energyCost;
  }

  private async processActivity(activity: Activity): Promise<InteractionResult> {
    const { rewards } = activity;
    
    const statChanges: Partial<Stats> = {
      wisdom: rewards.wisdom || 0,
      empathy: rewards.empathy || 0,
      energy: (rewards.energy || 0) - activity.energyCost,
      happiness: rewards.happiness || 0,
    };

    await this.onStatsUpdate(statChanges);
    
    if (rewards.relationshipPoints) {
      await this.onRelationshipUpdate(rewards.relationshipPoints);
    }

    return {
      success: true,
      message: `Successfully completed ${activity.name}!`,
      statChanges: {
        ...statChanges,
        relationshipPoints: rewards.relationshipPoints,
      },
      memories: [
        `Completed activity: ${activity.name}`,
        `Felt ${this.getEmotionalResponse(activity)}`,
      ],
    };
  }

  private getEmotionalResponse(activity: Activity): string {
    const emotions: Record<ActivityType, string[]> = {
      play: ['joyful', 'excited', 'energetic'],
      learn: ['curious', 'focused', 'enlightened'],
      feed: ['satisfied', 'content', 'nourished'],
      rest: ['peaceful', 'relaxed', 'refreshed'],
    };

    const possibleEmotions = emotions[activity.type];
    return possibleEmotions[Math.floor(Math.random() * possibleEmotions.length)];
  }
}