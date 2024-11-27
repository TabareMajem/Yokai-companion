import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import OpenAI from 'openai';
import { getAIConfig } from '../config/ai';
import { EnhancedMemoryManager } from './EnhancedMemoryManager';

export class SELService {
  private llm: ChatOpenAI;
  private tts: OpenAI;
  private memoryManager: EnhancedMemoryManager;

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
  }

  public async generateResponse(
    input: string,
    context: Record<string, unknown>
  ): Promise<string> {
    const memories = await this.memoryManager.queryMemories(input, 3);
    const prompt = new PromptTemplate({
      template: `As a supportive AI companion focused on social-emotional learning:

Context: {context}
Recent Memories: {memories}
User Input: {input}

Consider:
1. Emotional awareness and regulation
2. Social skills and relationships
3. Decision-making and problem-solving
4. Growth mindset and resilience
5. Cultural sensitivity and empathy

Respond with:
1. Validation of emotions
2. Specific SEL strategies
3. Growth-oriented feedback
4. Actionable next steps`,
      inputVariables: ['context', 'memories', 'input']
    });

    const formattedPrompt = await prompt.format({
      context: JSON.stringify(context),
      memories: memories.map(m => m.memory.content).join('\n'),
      input
    });

    const response = await this.llm.invoke(formattedPrompt);
    return response.content;
  }

  public async generateSpeech(text: string): Promise<ArrayBuffer> {
    const response = await this.tts.audio.speech.create({
      model: 'tts-1',
      voice: 'nova',
      input: text
    });

    return await response.arrayBuffer();
  }
}