import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import OpenAI from 'openai';
import { MindfulnessExercise, MindfulnessContext, MindfulnessFocus } from '../types';
import { getConfig } from '../../../config/openai';

export class MindfulnessGenerator {
  private llm: ChatOpenAI;
  private tts: OpenAI;
  private exercisePrompt: PromptTemplate;

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

    this.exercisePrompt = new PromptTemplate({
      template: `Create a mindfulness exercise with the following parameters:

Focus Area: {focus}
Duration: {duration} minutes
User Context:
{context}

The exercise should include:
1. A gentle introduction
2. Clear guidance for the main practice
3. Support for common difficulties
4. A calming closure

Consider the user's experience level and preferences while maintaining:
- Clear, simple instructions
- Gentle, supportive tone
- Progressive depth
- Flexibility for different skill levels

Format the response as a structured exercise with specific segments for:
- Introduction
- Main practice steps
- Guidance for difficulties
- Closing practice`,
      inputVariables: ['focus', 'duration', 'context']
    });
  }

  public async generateExercise(
    focus: MindfulnessFocus,
    duration: number,
    context: MindfulnessContext
  ): Promise<MindfulnessExercise> {
    try {
      const prompt = await this.exercisePrompt.format({
        focus,
        duration,
        context: JSON.stringify(context)
      });

      const response = await this.llm.invoke(prompt);
      return this.parseExerciseResponse(response.content, focus, duration);
    } catch (error) {
      console.error('Error generating mindfulness exercise:', error);
      throw new Error('Failed to generate mindfulness exercise');
    }
  }

  public async generateAudio(text: string): Promise<ArrayBuffer> {
    try {
      const response = await this.tts.audio.speech.create({
        model: 'tts-1',
        voice: 'nova',
        input: text,
      });

      return await response.arrayBuffer();
    } catch (error) {
      console.error('Error generating audio:', error);
      throw new Error('Failed to generate audio guidance');
    }
  }

  private parseExerciseResponse(
    content: string,
    focus: MindfulnessFocus,
    duration: number
  ): MindfulnessExercise {
    return {
      id: crypto.randomUUID(),
      type: 'MindfulnessExercise',
      focus,
      difficulty: 1,
      duration,
      objective: 'Develop present-moment awareness and emotional balance',
      structure: {
        introduction: 'Find a comfortable position and take a few deep breaths...',
        mainPractice: [
          'Focus your attention gently...',
          'Notice any thoughts or sensations...',
          'Return to your anchor point...'
        ],
        closure: 'Gradually bring your awareness back...'
      },
      guidance: {
        posture: 'Sit comfortably with your back straight but not rigid',
        attention: 'Rest your attention lightly on your chosen focus',
        breathing: 'Breathe naturally and easily',
        difficulties: [
          'Mind wandering is normal, simply return to your focus',
          'No need to judge or criticize yourself',
          'Adjust your position if needed'
        ]
      },
      adaptations: {
        shorter: 'Focus only on the breath for a few minutes',
        longer: 'Expand awareness to include sounds and sensations',
        difficult: 'Use counting or labeling to support focus'
      },
      instructions: [
        'Find a comfortable position',
        'Set your intention',
        'Focus on the present moment',
        'Notice and acknowledge thoughts',
        'Return to your anchor point'
      ],
      requiredStats: {
        wisdom: 5,
        empathy: 5
      },
      outcomes: [
        { skill: 'wisdom', impact: 3 },
        { skill: 'empathy', impact: 2 },
        { skill: 'energy', impact: 5 }
      ]
    };
  }
}