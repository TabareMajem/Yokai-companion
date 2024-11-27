import { useState, useCallback } from 'react';
import { MindfulnessGenerator } from '../services/MindfulnessGenerator';
import { MindfulnessExercise, MindfulnessContext, MindfulnessFocus } from '../types';
import { useYokaiStore } from '../../../store/yokaiStore';

export function useMindfulnessExercise() {
  const [exercise, setExercise] = useState<MindfulnessExercise | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { yokai } = useYokaiStore();
  const generator = new MindfulnessGenerator();

  const generateExercise = useCallback(async (
    focus: MindfulnessFocus,
    duration: number,
    context: Partial<MindfulnessContext> = {}
  ) => {
    if (!yokai) return;

    setIsGenerating(true);
    try {
      const mindfulnessContext: MindfulnessContext = {
        previousSessions: context.previousSessions || 0,
        averageDuration: context.averageDuration || 5,
        preferredFocus: context.preferredFocus || ['breath'],
        challengeAreas: context.challengeAreas || ['mind wandering'],
        environmentalFactors: context.environmentalFactors || ['quiet space']
      };

      const newExercise = await generator.generateExercise(
        focus,
        duration,
        mindfulnessContext
      );
      setExercise(newExercise);
      return newExercise;
    } catch (error) {
      console.error('Error generating exercise:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [yokai]);

  return {
    exercise,
    isGenerating,
    generateExercise
  };
}