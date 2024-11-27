import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { ExposureHierarchy, ExposureStep, ExposureContext } from '../types/exposure';
import { getConfig } from '../../../config/openai';

export class ExposureHierarchyBuilder {
  private llm: ChatOpenAI;
  private hierarchyPrompt: PromptTemplate;

  constructor() {
    const { openaiApiKey } = getConfig();
    
    this.llm = new ChatOpenAI({
      modelName: 'gpt-4',
      temperature: 0.7,
      openAIApiKey: openaiApiKey,
      dangerouslyAllowBrowser: true
    });

    this.hierarchyPrompt = new PromptTemplate({
      template: `Create a gradual exposure hierarchy for the following target:

Target Situation: {target}
Current Anxiety Level: {currentAnxiety}/100
Previous Exposure Experience: {previousExposures}
Available Support: {availableSupport}
Preferred Coping Strategies: {copingStrategies}
Environmental Factors: {environmentalFactors}

Generate a hierarchy that:
1. Starts with minimally anxiety-provoking situations (around 20-30/100)
2. Gradually increases in difficulty
3. Includes 6-8 steps
4. Incorporates available support and coping strategies
5. Considers environmental factors

For each step, provide:
- Detailed situation description
- Anticipated anxiety level (0-100)
- Recommended duration
- Specific supports needed
- Relevant coping strategies

Also include:
- Clear progression rules
- Success criteria for each step
- Guidelines for handling setbacks
- Safety considerations`,
      inputVariables: [
        'target',
        'currentAnxiety',
        'previousExposures',
        'availableSupport',
        'copingStrategies',
        'environmentalFactors'
      ]
    });
  }

  public async buildHierarchy(
    target: string,
    context: ExposureContext
  ): Promise<ExposureHierarchy> {
    try {
      const prompt = await this.hierarchyPrompt.format({
        target,
        currentAnxiety: context.currentAnxiety,
        previousExposures: context.previousExposures.join(', '),
        availableSupport: context.availableSupport.join(', '),
        copingStrategies: context.preferredCopingStrategies.join(', '),
        environmentalFactors: context.environmentalFactors.join(', ')
      });

      const response = await this.llm.invoke(prompt);
      return this.parseHierarchyResponse(response.content, target);
    } catch (error) {
      console.error('Error building exposure hierarchy:', error);
      throw new Error('Failed to build exposure hierarchy');
    }
  }

  private parseHierarchyResponse(content: string, target: string): ExposureHierarchy {
    // This is a simplified implementation
    // In a real system, you'd want more robust parsing of the LLM response
    const steps: ExposureStep[] = [
      {
        situation: 'Imaginal exposure through visualization',
        anticipatedAnxiety: 30,
        duration: 10,
        supports: ['Therapist guidance', 'Safe environment'],
        copingStrategies: ['Deep breathing', 'Grounding techniques']
      },
      {
        situation: 'Virtual exposure through videos or images',
        anticipatedAnxiety: 45,
        duration: 15,
        supports: ['Companion present', 'Controlled environment'],
        copingStrategies: ['Progressive muscle relaxation', 'Positive self-talk']
      },
      {
        situation: 'Limited real-world exposure',
        anticipatedAnxiety: 60,
        duration: 20,
        supports: ['Support person nearby', 'Easy exit available'],
        copingStrategies: ['Mindfulness', 'Coping statements']
      },
      {
        situation: 'Extended real-world exposure',
        anticipatedAnxiety: 75,
        duration: 30,
        supports: ['Phone support available', 'Safety plan in place'],
        copingStrategies: ['STOP technique', 'Reality testing']
      }
    ];

    return {
      target,
      steps,
      progressionRules: {
        successCriteria: [
          'Anxiety reduction of 50% during exposure',
          'Completion of full duration',
          'Use of coping strategies'
        ],
        advancementThreshold: 2, // Number of successful attempts needed
        setbackHandling: [
          'Return to previous step',
          'Review and adjust coping strategies',
          'Increase support temporarily'
        ]
      },
      safetyGuidelines: [
        'Stop if anxiety becomes overwhelming',
        'Use support system when needed',
        'Practice coping skills regularly',
        'Monitor physical symptoms'
      ]
    };
  }
}