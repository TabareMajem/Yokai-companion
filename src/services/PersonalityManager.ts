import { PersonalityTrait, PersonalityResponse, CulturalElement } from '../types/personality';
import { KITSUNE_TRAITS } from '../data/traits';
import { YokaiProfile } from '../types/yokai';
import { MemoryManager } from './MemoryManager';

export class PersonalityManager {
  private activeTraits: Set<string>;
  private culturalContext: Map<string, CulturalElement>;

  constructor(
    private yokaiProfile: YokaiProfile,
    private memoryManager: MemoryManager
  ) {
    this.activeTraits = new Set(yokaiProfile.traits.map(t => t.id));
    this.culturalContext = new Map();
    this.initializeCulturalContext();
  }

  public async generateResponse(
    input: string,
    context: Record<string, unknown> = {}
  ): Promise<PersonalityResponse> {
    const relevantMemories = await this.memoryManager.queryRelevantMemories(input);
    const emotionalState = this.memoryManager.getShortTermMemory().emotionalState;
    
    const availableTraits = KITSUNE_TRAITS.filter(
      trait => trait.evolutionStage <= this.yokaiProfile.evolutionStage
    );

    const culturalReferences = this.selectCulturalReferences(availableTraits);
    const tone = this.determineTone(emotionalState, context);

    return {
      content: this.constructResponse(input, relevantMemories, availableTraits),
      tone,
      culturalReferences
    };
  }

  public canUnlockTrait(trait: PersonalityTrait): boolean {
    if (trait.evolutionStage > this.yokaiProfile.evolutionStage) {
      return false;
    }

    if (this.activeTraits.has(trait.id)) {
      return false;
    }

    if (trait.statBonuses) {
      for (const [stat, required] of Object.entries(trait.statBonuses)) {
        if ((this.yokaiProfile.stats[stat as keyof typeof this.yokaiProfile.stats] || 0) < required) {
          return false;
        }
      }
    }

    return true;
  }

  private initializeCulturalContext(): void {
    KITSUNE_TRAITS.forEach(trait => {
      trait.culturalElements.forEach(element => {
        this.culturalContext.set(element.name, element);
      });
    });
  }

  private selectCulturalReferences(traits: PersonalityTrait[]): string[] {
    const references: string[] = [];
    const availableReferences = traits.flatMap(t => 
      t.culturalElements.map(e => e.name)
    );

    // Select 1-3 random references
    const count = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < count; i++) {
      const index = Math.floor(Math.random() * availableReferences.length);
      references.push(availableReferences[index]);
    }

    return references;
  }

  private determineTone(emotionalState: string, context: Record<string, unknown>): string {
    const toneMap: Record<string, string> = {
      'very happy': 'enthusiastic',
      'happy': 'cheerful',
      'content': 'balanced',
      'tired': 'gentle',
      'exhausted': 'soothing'
    };

    return toneMap[emotionalState] || 'balanced';
  }

  private constructResponse(
    input: string,
    memories: any[],
    traits: PersonalityTrait[]
  ): string {
    // This is a placeholder. In a real implementation, this would use
    // LangChain or another LLM to generate contextual responses
    return `Response based on ${traits.length} traits and ${memories.length} memories`;
  }
}