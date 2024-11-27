import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import OpenAI from 'openai';
import { 
  ScheduledActivity, 
  TimeCommitment, 
  UserPreferences,
  SchedulingResult,
  TimeRange 
} from '../types';
import { getConfig } from '../../../config/openai';

export class ActivityScheduler {
  private llm: ChatOpenAI;
  private tts: OpenAI;
  private schedulingPrompt: PromptTemplate;

  constructor() {
    const { openaiApiKey } = getConfig();
    
    this.llm = new ChatOpenAI({
      modelName: 'gpt-4',
      temperature: 0.7,
      openAIApiKey: openaiApiKey,
      dangerouslyAllowBrowser: true
    });

    this.tts = new OpenAI({
      apiKey: openaiApiKey,
      dangerouslyAllowBrowser: true
    });

    this.schedulingPrompt = new PromptTemplate({
      template: `Create an optimal activity schedule considering:

User Preferences:
{preferences}

Weekly Commitments:
{commitments}

Energy Patterns:
{energyPatterns}

Generate a schedule that:
1. Maximizes engagement and success likelihood
2. Considers energy levels throughout the day
3. Accounts for preparation and transition time
4. Includes backup plans for barriers
5. Integrates accountability measures

For each activity provide:
- Optimal time slot
- Required preparation
- Potential barriers and solutions
- Support system integration
- Success metrics`,
      inputVariables: ['preferences', 'commitments', 'energyPatterns']
    });
  }

  public async generateSchedule(
    preferences: UserPreferences,
    commitments: TimeCommitment[]
  ): Promise<SchedulingResult> {
    try {
      const prompt = await this.schedulingPrompt.format({
        preferences: JSON.stringify(preferences),
        commitments: JSON.stringify(commitments),
        energyPatterns: JSON.stringify(preferences.energyLevels)
      });

      const response = await this.llm.invoke(prompt);
      return this.parseSchedulingResponse(response.content, preferences, commitments);
    } catch (error) {
      console.error('Error generating schedule:', error);
      throw new Error('Failed to generate activity schedule');
    }
  }

  public async generateAudioBriefing(schedule: SchedulingResult): Promise<ArrayBuffer> {
    const briefing = this.createScheduleBriefing(schedule);
    
    try {
      const response = await this.tts.audio.speech.create({
        model: 'tts-1',
        voice: 'nova',
        input: briefing,
      });

      return await response.arrayBuffer();
    } catch (error) {
      console.error('Error generating audio briefing:', error);
      throw new Error('Failed to generate audio briefing');
    }
  }

  private findAvailableTimeSlots(
    commitments: TimeCommitment[],
    preferences: UserPreferences
  ): TimeRange[] {
    // Implementation to find available time slots
    // This is a simplified version
    const availableSlots: TimeRange[] = [];
    const occupiedSlots = new Set<number>();

    // Mark occupied slots
    commitments.forEach(commitment => {
      for (let hour = commitment.timeSlot.start; hour < commitment.timeSlot.end; hour++) {
        occupiedSlots.add(hour);
      }
    });

    // Find continuous available slots
    let currentSlot: TimeRange | null = null;
    for (let hour = 0; hour < 24; hour++) {
      if (!occupiedSlots.has(hour) && preferences.energyLevels[hour] > 30) {
        if (!currentSlot) {
          currentSlot = { start: hour, end: hour + 1 };
        } else {
          currentSlot.end = hour + 1;
        }
      } else if (currentSlot) {
        availableSlots.push({ ...currentSlot });
        currentSlot = null;
      }
    }

    if (currentSlot) {
      availableSlots.push(currentSlot);
    }

    return availableSlots;
  }

  private parseSchedulingResponse(
    content: string,
    preferences: UserPreferences,
    commitments: TimeCommitment[]
  ): SchedulingResult {
    // This is a simplified implementation
    const availableSlots = this.findAvailableTimeSlots(commitments, preferences);
    const activities: ScheduledActivity[] = [];
    const timeSlots: { [key: string]: TimeRange } = {};
    const conflicts: string[] = [];
    const suggestions: string[] = [];

    // Generate some example activities
    const activityTypes: Array<{
      type: ScheduledActivity['type'];
      name: string;
      duration: number;
    }> = [
      { type: 'pleasure', name: 'Nature Walk', duration: 30 },
      { type: 'mastery', name: 'Skill Practice', duration: 45 },
      { type: 'social', name: 'Friend Meetup', duration: 60 },
      { type: 'self-care', name: 'Meditation', duration: 20 }
    ];

    availableSlots.forEach((slot, index) => {
      if (index < activityTypes.length) {
        const activity: ScheduledActivity = {
          id: crypto.randomUUID(),
          ...activityTypes[index],
          description: `Scheduled ${activityTypes[index].name.toLowerCase()} activity`,
          timeSlot: {
            preferredTime: slot,
            duration: activityTypes[index].duration,
            flexibility: 2
          },
          preparation: ['Set reminder', 'Prepare necessary items'],
          barriers: ['Time management', 'Energy levels'],
          solutions: ['Start with small steps', 'Use accountability partner'],
          accountability: preferences.supportSystem,
          requiredStats: {
            energy: 20
          },
          rewards: {
            happiness: 3,
            energy: 2
          }
        };

        activities.push(activity);
        timeSlots[activity.id] = slot;
      }
    });

    if (activities.length < activityTypes.length) {
      conflicts.push('Not enough available time slots for all activities');
      suggestions.push('Consider rearranging commitments to create more available slots');
    }

    return {
      activities,
      timeSlots,
      conflicts,
      suggestions
    };
  }

  private createScheduleBriefing(schedule: SchedulingResult): string {
    return `Here's your activity schedule:
${schedule.activities.map(activity => 
  `${activity.name} at ${this.formatTimeRange(schedule.timeSlots[activity.id])}. 
   Remember to ${activity.preparation[0].toLowerCase()}.`
).join('\n\n')}

${schedule.suggestions.length > 0 ? '\nSuggestions:\n' + schedule.suggestions.join('\n') : ''}`;
  }

  private formatTimeRange(range: TimeRange): string {
    const formatHour = (hour: number) => {
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}${period}`;
    };
    return `${formatHour(range.start)} to ${formatHour(range.end)}`;
  }
}