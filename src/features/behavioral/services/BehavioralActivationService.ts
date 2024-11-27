import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import OpenAI from 'openai';
import { Activity, UserPreferences, ActivitySchedule } from '../types';
import { getAIConfig } from '../../../config/ai';
import { EnhancedMemoryManager } from '../../../services/EnhancedMemoryManager';

export class BehavioralActivationService {
  private llm: ChatOpenAI;
  private tts: OpenAI;
  private memoryManager: EnhancedMemoryManager;
  private activityPrompt: PromptTemplate;

  constructor(memoryManager: EnhancedMemoryManager) {
    const config = getAIConfig();
    
    this.llm = new ChatOpenAI({
      modelName: 'gpt-4',
      temperature: 0.7,
      openAIApiKey: config.openaiApiKey,
      dangerouslyAllowBrowser: true
    });

    this.tts = new OpenAI({
      apiKey: config.openaiApiKey,
      dangerouslyAllowBrowser: true
    });

    this.memoryManager = memoryManager;
    this.activityPrompt = this.createActivityPrompt();
  }

  private createActivityPrompt(): PromptTemplate {
    return new PromptTemplate({
      template: `Generate personalized activities based on:

User Preferences:
{preferences}

Recent Activities:
{recentActivities}

Current Energy Level: {energyLevel}
Time Available: {timeAvailable} minutes

Generate activities that:
1. Match user's interests and energy level
2. Balance pleasure and mastery
3. Consider limitations and barriers
4. Include preparation steps
5. Provide solution strategies

Format each activity with:
- Clear description
- Required preparation
- Potential barriers
- Solution strategies
- Expected rewards`,
      inputVariables: [
        'preferences',
        'recentActivities',
        'energyLevel',
        'timeAvailable'
      ]
    });
  }

  public async generateActivities(
    preferences: UserPreferences,
    energyLevel: number,
    timeAvailable: number
  ): Promise<Activity[]> {
    try {
      const recentActivities = await this.memoryManager.queryMemories(
        'activity',
        5
      );

      const prompt = await this.activityPrompt.format({
        preferences: JSON.stringify(preferences),
        recentActivities: recentActivities.map(m => m.memory.content).join('\n'),
        energyLevel,
        timeAvailable
      });

      const response = await this.llm.invoke(prompt);
      return this.parseActivities(response.content);
    } catch (error) {
      console.error('Error generating activities:', error);
      throw new Error('Failed to generate activities');
    }
  }

  public async generateSchedule(
    activities: Activity[],
    preferences: UserPreferences
  ): Promise<ActivitySchedule> {
    // Implementation for generating an optimal schedule
    return {
      activities,
      timeSlots: {},
      energyDistribution: Array(24).fill(0),
      dailyGoals: {
        pleasure: 0,
        mastery: 0,
        connection: 0
      }
    };
  }

  public async generateGuidance(activity: Activity): Promise<ArrayBuffer> {
    const guidance = `Let's get started with ${activity.name}. 
      First, ${activity.preparation.join('. ')}. 
      Remember, if you encounter ${activity.barriers.join(' or ')}, 
      you can try ${activity.solutions.join(' or ')}.
      This activity will help you build ${Object.keys(activity.rewards.stats).join(' and ')}.`;

    try {
      const response = await this.tts.audio.speech.create({
        model: 'tts-1',
        voice: 'nova',
        input: guidance
      });

      return await response.arrayBuffer();
    } catch (error) {
      console.error('Error generating audio guidance:', error);
      throw new Error('Failed to generate audio guidance');
    }
  }

  private parseActivities(content: string): Activity[] {
    // This is a simplified implementation
    // In a real system, you'd want more robust parsing
    return [{
      id: crypto.randomUUID(),
      name: 'Nature Walk',
      description: 'A peaceful walk in nature to boost mood and energy',
      category: 'pleasure',
      difficulty: 1,
      duration: 30,
      energyRequired: 3,
      rewards: {
        pleasure: 8,
        mastery: 2,
        connection: 0,
        stats: {
          energy: 5,
          happiness: 3
        }
      },
      preparation: [
        'Choose a suitable location',
        'Wear comfortable shoes',
        'Bring water'
      ],
      barriers: [
        'Weather',
        'Time constraints',
        'Low motivation'
      ],
      solutions: [
        'Check weather forecast',
        'Schedule in advance',
        'Start with a short walk'
      ]
    }];
  }
}