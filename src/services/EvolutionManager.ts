import { EvolutionStage, Stats, Trait, YokaiProfile } from '../types/yokai';

export const EVOLUTION_REQUIREMENTS = {
  STAGE_1_TO_2: {
    MIN_RELATIONSHIP_LEVEL: 5,
    MIN_WISDOM: 60,
    MIN_EMPATHY: 50,
    REQUIRED_TRAITS: ['Basic Empathy', 'Curiosity']
  },
  STAGE_2_TO_3: {
    MIN_RELATIONSHIP_LEVEL: 8,
    MIN_WISDOM: 80,
    MIN_EMPATHY: 75,
    REQUIRED_TRAITS: ['Enhanced Empathy', 'Spiritual Connection']
  }
} as const;

export interface EvolutionProgress {
  overallProgress: number;
  detailedProgress: {
    relationshipLevel: number;
    wisdom: number;
    empathy: number;
    traits: number;
  };
}

export class EvolutionManager {
  constructor(
    private yokaiProfile: YokaiProfile,
    private onEvolution: (newStage: EvolutionStage) => Promise<void>
  ) {}

  public async checkEvolution(): Promise<boolean> {
    const currentStage = this.yokaiProfile.evolutionStage;
    
    if (currentStage === 3) return false;
    
    const requirements = currentStage === 1 
      ? EVOLUTION_REQUIREMENTS.STAGE_1_TO_2 
      : EVOLUTION_REQUIREMENTS.STAGE_2_TO_3;

    const canEvolve = this.meetsRequirements(requirements);
    
    if (canEvolve) {
      const newStage = (currentStage + 1) as EvolutionStage;
      await this.onEvolution(newStage);
      return true;
    }
    
    return false;
  }

  public calculateProgress(): EvolutionProgress {
    const currentStage = this.yokaiProfile.evolutionStage;
    if (currentStage === 3) {
      return this.getMaxProgress();
    }

    const requirements = currentStage === 1 
      ? EVOLUTION_REQUIREMENTS.STAGE_1_TO_2 
      : EVOLUTION_REQUIREMENTS.STAGE_2_TO_3;

    const relationshipProgress = Math.min(
      this.yokaiProfile.relationshipLevel / requirements.MIN_RELATIONSHIP_LEVEL,
      1
    );

    const wisdomProgress = Math.min(
      this.yokaiProfile.stats.wisdom / requirements.MIN_WISDOM,
      1
    );

    const empathyProgress = Math.min(
      this.yokaiProfile.stats.empathy / requirements.MIN_EMPATHY,
      1
    );

    const traitsProgress = this.calculateTraitsProgress(requirements.REQUIRED_TRAITS);

    const overallProgress = (
      relationshipProgress +
      wisdomProgress +
      empathyProgress +
      traitsProgress
    ) / 4;

    return {
      overallProgress,
      detailedProgress: {
        relationshipLevel: relationshipProgress,
        wisdom: wisdomProgress,
        empathy: empathyProgress,
        traits: traitsProgress
      }
    };
  }

  private meetsRequirements(requirements: typeof EVOLUTION_REQUIREMENTS.STAGE_1_TO_2 | typeof EVOLUTION_REQUIREMENTS.STAGE_2_TO_3): boolean {
    return (
      this.yokaiProfile.relationshipLevel >= requirements.MIN_RELATIONSHIP_LEVEL &&
      this.yokaiProfile.stats.wisdom >= requirements.MIN_WISDOM &&
      this.yokaiProfile.stats.empathy >= requirements.MIN_EMPATHY &&
      this.hasRequiredTraits(requirements.REQUIRED_TRAITS)
    );
  }

  private hasRequiredTraits(requiredTraits: string[]): boolean {
    const currentTraits = new Set(this.yokaiProfile.traits.map(t => t.name));
    return requiredTraits.every(trait => currentTraits.has(trait));
  }

  private calculateTraitsProgress(requiredTraits: string[]): number {
    const currentTraits = new Set(this.yokaiProfile.traits.map(t => t.name));
    const acquiredTraits = requiredTraits.filter(trait => currentTraits.has(trait));
    return acquiredTraits.length / requiredTraits.length;
  }

  private getMaxProgress(): EvolutionProgress {
    return {
      overallProgress: 1,
      detailedProgress: {
        relationshipLevel: 1,
        wisdom: 1,
        empathy: 1,
        traits: 1
      }
    };
  }
}