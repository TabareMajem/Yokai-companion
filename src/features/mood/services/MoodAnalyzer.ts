import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { 
  MoodEntry, 
  MoodAnalysis, 
  EmotionalPattern,
  TherapeuticResponse 
} from '../types';
import { getConfig } from '../../../config/openai';

export class MoodAnalyzer {
  private llm: ChatOpenAI;
  private analysisPrompt: PromptTemplate;
  private responsePrompt: PromptTemplate;

  constructor() {
    const { openaiApiKey } = getConfig();
    
    this.llm = new ChatOpenAI({
      modelName: 'gpt-4',
      temperature: 0.7,
      openAIApiKey: openaiApiKey,
      dangerouslyAllowBrowser: true
    });

    this.analysisPrompt = new PromptTemplate({
      template: `Analyze the following mood entries to identify patterns and provide insights:

Mood History:
{moodHistory}

Consider:
1. Emotional patterns and cycles
2. Common triggers and their impact
3. Time-of-day correlations
4. Environmental factors
5. Social context influences

Provide analysis focusing on:
- Dominant emotional patterns
- Trigger-emotion relationships
- Situational influences
- Potential intervention points
- Progress indicators

Format the response as a structured analysis with specific recommendations.`,
      inputVariables: ['moodHistory']
    });

    this.responsePrompt = new PromptTemplate({
      template: `Generate a therapeutic response for the following emotional state:

Current Mood: {currentMood}
Intensity: {intensity}
Triggers: {triggers}
Recent History: {recentHistory}
Therapeutic Goals: {therapeuticGoals}

The response should:
1. Validate the emotional experience
2. Provide immediate support
3. Offer relevant coping strategies
4. Include elements of CBT principles
5. Maintain a supportive and empathetic tone

Consider the user's current state and history while crafting the response.`,
      inputVariables: [
        'currentMood',
        'intensity',
        'triggers',
        'recentHistory',
        'therapeuticGoals'
      ]
    });
  }

  public async analyzeMoodHistory(
    entries: MoodEntry[],
    timeframe: { start: Date; end: Date }
  ): Promise<MoodAnalysis> {
    try {
      const prompt = await this.analysisPrompt.format({
        moodHistory: JSON.stringify(entries)
      });

      const response = await this.llm.invoke(prompt);
      return this.parseMoodAnalysis(response.content);
    } catch (error) {
      console.error('Error analyzing mood history:', error);
      throw new Error('Failed to analyze mood history');
    }
  }

  public async generateTherapeuticResponse(
    currentMood: MoodEntry,
    recentEntries: MoodEntry[],
    therapeuticGoals: string[]
  ): Promise<TherapeuticResponse> {
    try {
      const prompt = await this.responsePrompt.format({
        currentMood: currentMood.primary,
        intensity: currentMood.intensity,
        triggers: currentMood.triggers.join(', '),
        recentHistory: JSON.stringify(recentEntries),
        therapeuticGoals: therapeuticGoals.join(', ')
      });

      const response = await this.llm.invoke(prompt);
      return this.parseTherapeuticResponse(response.content);
    } catch (error) {
      console.error('Error generating therapeutic response:', error);
      throw new Error('Failed to generate therapeutic response');
    }
  }

  private parseMoodAnalysis(content: string): MoodAnalysis {
    // This is a simplified implementation
    // In a real system, you'd want more robust parsing of the LLM response
    return {
      patterns: [],
      triggers: [],
      recommendations: content.split('\n').filter(line => line.startsWith('- '))
    };
  }

  private parseTherapeuticResponse(content: string): TherapeuticResponse {
    // This is a simplified implementation
    return {
      content: content,
      type: 'support',
      suggestedActivities: ['Mindful breathing', 'Gentle walking', 'Journaling'],
      copingStrategies: ['Grounding techniques', 'Progressive relaxation', 'Positive self-talk']
    };
  }

  private identifyEmotionalPatterns(entries: MoodEntry[]): EmotionalPattern[] {
    const patterns: Record<string, EmotionalPattern> = {};

    entries.forEach(entry => {
      if (!patterns[entry.primary]) {
        patterns[entry.primary] = {
          emotion: entry.primary,
          frequency: 0,
          averageIntensity: 0,
          commonTriggers: [],
          timeDistribution: {
            morning: 0,
            afternoon: 0,
            evening: 0,
            night: 0
          }
        };
      }

      const pattern = patterns[entry.primary];
      pattern.frequency += 1;
      pattern.averageIntensity += entry.intensity;
      
      // Update triggers
      entry.triggers.forEach(trigger => {
        if (!pattern.commonTriggers.includes(trigger)) {
          pattern.commonTriggers.push(trigger);
        }
      });

      // Update time distribution
      const hour = entry.timestamp.getHours();
      if (hour >= 5 && hour < 12) pattern.timeDistribution.morning += 1;
      else if (hour >= 12 && hour < 17) pattern.timeDistribution.afternoon += 1;
      else if (hour >= 17 && hour < 22) pattern.timeDistribution.evening += 1;
      else pattern.timeDistribution.night += 1;
    });

    // Calculate averages
    return Object.values(patterns).map(pattern => ({
      ...pattern,
      averageIntensity: pattern.averageIntensity / pattern.frequency
    }));
  }
}