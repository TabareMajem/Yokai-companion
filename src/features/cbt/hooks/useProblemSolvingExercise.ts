import { useState, useCallback } from 'react';
import { ProblemSolvingGenerator } from '../services/ProblemSolvingGenerator';
import { ProblemSolvingExercise, UserContext } from '../types/problemSolving';
import { useYokaiStore } from '../../../store/yokaiStore';

export function useProblemSolvingExercise() {
  const [exercise, setExercise] = useState<ProblemSolvingExercise | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { yokai } = useYokaiStore();
  const generator = new ProblemSolvingGenerator();

  const generateExercise = useCallback(async (
    problem: string,
    context: Partial<UserContext> = {}
  ) => {
    if (!yokai) return;

    setIsGenerating(true);
    try {
      const userContext: UserContext = {
        emotionalState: context.emotionalState || 'neutral',
        availableSupport: context.availableSupport || [],
        pastCopingStrategies: context.pastCopingStrategies || [],
        resources: context.resources || [],
        recentProgress: context.recentProgress || {
          completedExercises: 0,
          successRate: 0
        }
      };

      const newExercise = await generator.generateExercise(problem, userContext);
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