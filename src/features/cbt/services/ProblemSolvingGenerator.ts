import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { ProblemSolvingExercise } from '../types';
import { getConfig } from '../../../config/openai';
import { UserContext } from '../types';

export class ProblemSolvingGenerator {
  private llm: ChatOpenAI;
  private exercisePrompt: PromptTemplate;

  constructor() {
    const { openaiApiKey } = getConfig();
    
    this.llm = new ChatOpenAI({
      modelName: 'gpt-4',
      temperature: 0.7,
      openAIApiKey: openaiApiKey,
      dangerouslyAllowBrowser: true
    });

    this.exercisePrompt = new PromptTemplate({
      template: `Create a structured problem-solving exercise for the following situation:

Problem: {problem}
User Context:
- Emotional State: {context.emotionalState}
- Available Support: {context.availableSupport}
- Past Coping Strategies: {context.pastCopingStrategies}
- Current Resources: {context.resources}

Generate a step-by-step problem-solving exercise that:
1. Breaks down the problem into manageable components
2. Explores multiple solution strategies
3. Evaluates feasibility and potential outcomes
4. Creates an implementation plan
5. Includes success metrics and follow-up steps

The exercise should be structured with:
- Clear problem definition
- Multiple solution options
- Evaluation criteria
- Implementation steps
- Progress tracking methods

Format the response as a structured exercise with specific prompts and guidance for each phase.`,
      inputVariables: ['problem', 'context']
    });
  }

  public async generateExercise(
    problem: string,
    context: UserContext
  ): Promise<ProblemSolvingExercise> {
    try {
      const prompt = await this.exercisePrompt.format({
        problem,
        context: JSON.stringify(context)
      });

      const response = await this.llm.invoke(prompt);
      return this.parseExerciseResponse(response.content, problem);
    } catch (error) {
      console.error('Error generating problem-solving exercise:', error);
      throw new Error('Failed to generate problem-solving exercise');
    }
  }

  private parseExerciseResponse(
    content: string,
    originalProblem: string
  ): ProblemSolvingExercise {
    // This is a simplified implementation
    // In a real system, you'd want more robust parsing
    return {
      id: crypto.randomUUID(),
      type: 'ProblemSolving',
      difficulty: 2,
      duration: 20,
      objective: `Develop a solution for: ${originalProblem}`,
      problem: {
        description: originalProblem,
        impact: ['Emotional well-being', 'Daily functioning'],
        barriers: ['Time constraints', 'Resource limitations']
      },
      steps: [
        {
          phase: 'define',
          prompts: ['What specific aspects of this problem trouble you the most?'],
          guidance: 'Be as specific as possible about the problem\'s impact',
          completionCriteria: ['Clear problem statement', 'Impact assessment']
        },
        {
          phase: 'generate',
          prompts: ['What are all the possible ways to address this?'],
          guidance: 'Don\'t judge solutions yet, just list all possibilities',
          completionCriteria: ['At least 3 potential solutions']
        },
        {
          phase: 'evaluate',
          prompts: ['What are the pros and cons of each solution?'],
          guidance: 'Consider feasibility and potential outcomes',
          completionCriteria: ['Evaluation of each solution']
        },
        {
          phase: 'implement',
          prompts: ['What specific steps will you take?'],
          guidance: 'Create a concrete action plan',
          completionCriteria: ['Detailed action steps', 'Timeline']
        },
        {
          phase: 'review',
          prompts: ['How will you know if the solution is working?'],
          guidance: 'Define success metrics',
          completionCriteria: ['Success indicators', 'Follow-up plan']
        }
      ],
      solutions: [],
      requiredStats: {
        wisdom: 15,
        empathy: 10
      },
      outcomes: [
        { skill: 'wisdom', impact: 4 },
        { skill: 'empathy', impact: 3 }
      ],
      instructions: [] // Will be populated from steps
    };
  }
}