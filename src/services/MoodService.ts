import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import OpenAI from 'openai';
import { getConfig } from '../config/openai';
import { EnhancedMemoryManager } from './EnhancedMemoryManager';
import { MoodEntry, MoodAnalysis, TherapeuticResponse } from '../features/mood/types';

export class MoodService {
  private llm: ChatOpenAI;
  private tts: OpenAI;
  private memoryManager: EnhancedMemoryManager;
  private analysisPrompt: PromptTemplate;
  private responsePrompt: PromptTemplate;

  constructor(memoryManager: EnhancedMemoryManager) {
    const config = getConfig();
    
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
    this.analysisPrompt = this.createAnalysisPrompt();
    this.responsePrompt = this.createResponsePrompt();
  }

  private createAnalysisPrompt(): PromptTemplate {
    return new PromptTemplate({
      template: `Analyze the following mood entries to identify patterns and insights:

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
  }

  private createResponsePrompt(): PromptTemplate {
    return new PromptTemplate({
      template: `Generate a therapeutic response for:

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

Include:
- Main response
- Suggested activities
- Coping strategies
- Follow-up guidance`,
      inputVariables: [
        'currentMood',
        'intensity',
        'triggers',
        'recentHistory',
        'therapeuticGoals'
      ]
    });
  }

  public async analyzeMood(entry: MoodEntry): Promise<MoodAnalysis> {
    try {
      // Get recent mood history
      const recentEntries = await this.memoryManager.queryMemories('mood', 5);
      
      const prompt = await this.analysisPrompt.format({
        moodHistory: JSON.stringify([...recentEntries, entry])
      });

      const response = await this.llm.invoke(prompt);
      return this.parseMoodAnalysis(response.content);
    } catch (error) {
      console.error('Error analyzing mood:', error);
      throw new Error('Failed to analyze mood');
    }
  }

  public async generateResponse(
    entry: MoodEntry,
    recentHistory: string
  ): Promise<TherapeuticResponse> {
    try {
      const prompt = await this.responsePrompt.format({
        currentMood: entry.primary,
        intensity: entry.intensity,
        triggers: entry.triggers.join(', '),
        recentHistory,
        therapeuticGoals: 'Improve emotional awareness, Develop coping strategies'
      });

      const response = await this.llm.invoke(prompt);
      return this.parseTherapeuticResponse(response.content);
    } catch (error) {
      console.error('Error generating response:', error);
      throw new Error('Failed to generate therapeutic response');
    }
  }

  public async generateSpeech(text: string): Promise<ArrayBuffer> {
    try {
      const response = await this.tts.audio.speech.create({
        model: 'tts-1',
        voice: 'nova',
        input: text
      });

      return await response.arrayBuffer();
    } catch (error) {
      console.error('Error generating speech:', error);
      throw new Error('Failed to generate speech');
    }
  }

  private parseMoodAnalysis(content: string): MoodAnalysis {
    // This is a simplified implementation
    // In a real system, you'd want more robust parsing
    return {
      patterns: [],
      triggers: [],
      recommendations: content.split('\n').filter(line => line.startsWith('- '))
    };
  }

  private parseTherapeuticResponse(content: string): TherapeuticResponse {
    // This is a simplified implementation
    return {
      content,
      type: 'support',
      suggestedActivities: ['Mindful breathing', 'Gentle walking', 'Journaling'],
      copingStrategies: ['Grounding techniques', 'Progressive relaxation', 'Positive self-talk']
    };
  }
}