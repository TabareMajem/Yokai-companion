import { ChatOpenAI } from '@langchain/openai';
import OpenAI from 'openai';
import { PromptTemplate } from 'langchain/prompts';
import { getConfig } from '../../../config/openai';

export class AIService {
  private llm: ChatOpenAI;
  private openai: OpenAI;
  private exercisePrompt: PromptTemplate;

  constructor() {
    const { openaiApiKey } = getConfig();
    
    this.llm = new ChatOpenAI({
      modelName: 'gpt-4',
      temperature: 0.7,
      openAIApiKey: openaiApiKey,
      dangerouslyAllowBrowser: true
    });

    this.openai = new OpenAI({
      apiKey: openaiApiKey,
      dangerouslyAllowBrowser: true
    });

    this.exercisePrompt = this.createExercisePrompt();
  }

  private createExercisePrompt(): PromptTemplate {
    return new PromptTemplate({
      template: `You are a supportive AI companion helping with CBT exercises.

Current exercise: {exerciseType}
Difficulty level: {difficulty}
User's emotional state: {emotionalState}

Previous response: {previousResponse}

Analyze the response considering:
1. Depth of reflection
2. Emotional awareness
3. Application of CBT principles
4. Progress towards exercise objectives

Provide:
1. A supportive analysis (2-3 sentences)
2. Specific suggestions for improvement
3. A follow-up question to deepen understanding

Current exercise step: {currentStep}
Exercise objective: {objective}`,
      inputVariables: [
        'exerciseType',
        'difficulty',
        'emotionalState',
        'previousResponse',
        'currentStep',
        'objective'
      ],
    });
  }

  public async analyzeResponse(
    exerciseType: string,
    difficulty: number,
    emotionalState: string,
    response: string,
    currentStep: string,
    objective: string
  ): Promise<string> {
    const prompt = await this.exercisePrompt.format({
      exerciseType,
      difficulty,
      emotionalState,
      previousResponse: response,
      currentStep,
      objective,
    });

    const result = await this.llm.invoke(prompt);
    return result.content;
  }

  public async generateSpeech(text: string): Promise<ArrayBuffer> {
    const response = await this.openai.audio.speech.create({
      model: 'tts-1',
      voice: 'nova',
      input: text,
    });

    return await response.arrayBuffer();
  }

  public async generateExerciseInsights(
    responses: string[],
    exerciseType: string,
    objective: string
  ): Promise<string[]> {
    const prompt = `Analyze the following responses to a ${exerciseType} exercise:

Objective: ${objective}

Responses:
${responses.map((r, i) => `Step ${i + 1}: ${r}`).join('\n')}

Provide 3-4 specific insights about:
1. The user's engagement with the exercise
2. Areas of progress or growth
3. Potential areas for future focus
4. Application of CBT principles`;

    const result = await this.llm.invoke(prompt);
    return result.content.split('\n').filter(line => line.trim());
  }
}