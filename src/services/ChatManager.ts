import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from 'langchain/prompts';
import { PersonalityManager } from './PersonalityManager';
import { MemoryManager } from './MemoryManager';
import { YokaiProfile } from '../types/yokai';

export class ChatManager {
  private model: ChatOpenAI;
  private basePrompt: PromptTemplate;

  constructor(
    private personalityManager: PersonalityManager,
    private memoryManager: MemoryManager,
    private yokaiProfile: YokaiProfile
  ) {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key is required. Please set VITE_OPENAI_API_KEY in your environment.');
    }
    
    this.model = new ChatOpenAI({
      modelName: 'gpt-4',
      temperature: 0.7,
      openAIApiKey: apiKey,
    });

    this.basePrompt = new PromptTemplate({
      template: `You are a Kitsune Yokai companion named {name}, currently at evolution stage {stage}.

Your traits: {traits}
Current emotional state: {emotionalState}

Recent memories: {memories}

Cultural context: {culturalContext}

Respond to: {input}

Remember to:
1. Stay in character as a Kitsune Yokai
2. Use your current traits and cultural knowledge
3. Reference relevant memories when appropriate
4. Maintain emotional consistency
5. Be supportive and nurturing while maintaining your mystical essence`,
      inputVariables: [
        'name',
        'stage',
        'traits',
        'emotionalState',
        'memories',
        'culturalContext',
        'input'
      ],
    });
  }

  public async generateResponse(userInput: string): Promise<string> {
    try {
      const memories = await this.memoryManager.queryRelevantMemories(userInput, 3);
      const emotionalState = this.memoryManager.getShortTermMemory().emotionalState;
      const personalityResponse = await this.personalityManager.generateResponse(
        userInput,
        { memories, emotionalState }
      );

      const prompt = await this.basePrompt.format({
        name: this.yokaiProfile.name,
        stage: this.yokaiProfile.evolutionStage,
        traits: this.yokaiProfile.traits.map(t => t.name).join(', '),
        emotionalState,
        memories: memories.map(m => m.memory.content).join('\n'),
        culturalContext: personalityResponse.culturalReferences.join(', '),
        input: userInput,
      });

      const response = await this.model.invoke(prompt);
      
      await this.memoryManager.storeMemory(
        userInput,
        'interaction',
        {
          response: response,
          emotionalState,
          culturalReferences: personalityResponse.culturalReferences,
        }
      );

      return response;
    } catch (error) {
      console.error('Error generating response:', error);
      throw new Error('Failed to generate response. Please check your OpenAI API key configuration.');
    }
  }
}