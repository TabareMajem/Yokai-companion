import { ChatOpenAI } from '@langchain/openai';
import OpenAI from 'openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { getConfig } from '../config/openai';
import { EnhancedMemoryManager } from './EnhancedMemoryManager';

export class AIService {
  private llm: ChatOpenAI;
  private openai: OpenAI;
  private memoryManager: EnhancedMemoryManager;
  private companionPrompt: PromptTemplate;

  constructor(memoryManager: EnhancedMemoryManager) {
    const config = getConfig();
    
    this.llm = new ChatOpenAI({
      modelName: 'gpt-4',
      temperature: 0.7,
      ...config
    });

    this.openai = new OpenAI({
      apiKey: config.openaiApiKey,
      dangerouslyAllowBrowser: true
    });

    this.memoryManager = memoryManager;

    this.companionPrompt = new PromptTemplate({
      template: `You are a supportive Kitsune Yokai companion.

Current Context:
{context}

Recent Memories:
{memories}

User Input: {input}

Consider:
1. User's emotional state and needs
2. Previous interactions and progress
3. Cultural elements and wisdom
4. Appropriate guidance level
5. Growth opportunities

Respond with:
1. Empathetic acknowledgment
2. Relevant wisdom or teaching
3. Practical guidance
4. Encouragement for growth`,
      inputVariables: ['context', 'memories', 'input']
    });
  }

  public async generateResponse(input: string, context: any): Promise<string> {
    try {
      // Retrieve relevant memories
      const memories = await this.memoryManager.queryMemories(input, 3);
      const memoriesText = memories
        .map(m => m.memory.content)
        .join('\n');

      const prompt = await this.companionPrompt.format({
        context: JSON.stringify(context),
        memories: memoriesText,
        input
      });

      const response = await this.llm.invoke(prompt);

      // Store the interaction in memory
      await this.memoryManager.storeMemory({
        id: crypto.randomUUID(),
        userId: context.userId,
        content: input,
        type: 'interaction',
        timestamp: new Date(),
        importance: this.calculateImportance(input, context),
        context: {
          response: response.content,
          emotionalState: context.emotionalState,
          type: 'user-interaction'
        }
      });

      return response.content;
    } catch (error) {
      console.error('Error generating response:', error);
      throw new Error('Failed to generate response');
    }
  }

  public async generateSpeech(text: string): Promise<ArrayBuffer> {
    try {
      const response = await this.openai.audio.speech.create({
        model: 'tts-1',
        voice: 'nova',
        input: text,
      });

      return await response.arrayBuffer();
    } catch (error) {
      console.error('Error generating speech:', error);
      throw new Error('Failed to generate speech');
    }
  }

  private calculateImportance(input: string, context: any): number {
    // Simple importance calculation based on emotional state and content
    let importance = 5; // Base importance

    // Increase importance for emotional content
    if (context.emotionalState === 'distressed' || 
        context.emotionalState === 'very happy') {
      importance += 2;
    }

    // Increase importance for longer, more detailed interactions
    if (input.length > 100) {
      importance += 1;
    }

    // Increase importance for interactions during significant events
    if (context.isSignificantEvent) {
      importance += 2;
    }

    return Math.min(10, importance);
  }
}