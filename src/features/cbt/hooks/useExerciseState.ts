import { useState, useCallback } from 'react';
import { CBTActivity, ActivityResult } from '../types';
import { useYokaiStore } from '../../../store/yokaiStore';
import { AIService } from '../services/AIService';

export function useExerciseState(aiService: AIService) {
  const [selectedActivity, setSelectedActivity] = useState<CBTActivity | null>(null);
  const [userResponses, setUserResponses] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState<ActivityResult | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const { yokai, updateStats } = useYokaiStore();

  const handleActivitySelect = useCallback((activity: CBTActivity) => {
    setSelectedActivity(activity);
    setUserResponses([]);
    setCurrentStep(0);
    setResult(null);
    setFeedback('');
  }, []);

  const handleResponseSubmit = useCallback(async (response: string) => {
    if (!selectedActivity || !yokai) return;

    const newResponses = [...userResponses, response];
    setUserResponses(newResponses);

    try {
      const analysis = await aiService.analyzeResponse(
        selectedActivity.type,
        selectedActivity.difficulty,
        yokai.stats.happiness > 70 ? 'positive' : 'neutral',
        response,
        selectedActivity.instructions[currentStep],
        selectedActivity.objective
      );

      setFeedback(analysis);

      if (currentStep < selectedActivity.instructions.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        const insights = await aiService.generateExerciseInsights(
          newResponses,
          selectedActivity.type,
          selectedActivity.objective
        );

        const result: ActivityResult = {
          completed: true,
          userResponses: newResponses,
          emotionalState: {
            before: 'neutral',
            after: 'improved'
          },
          statChanges: {
            wisdom: selectedActivity.outcomes.reduce(
              (sum, o) => sum + (o.skill === 'wisdom' ? o.impact : 0), 
              0
            ),
            empathy: selectedActivity.outcomes.reduce(
              (sum, o) => sum + (o.skill === 'empathy' ? o.impact : 0), 
              0
            ),
            happiness: selectedActivity.outcomes.reduce(
              (sum, o) => sum + (o.skill === 'happiness' ? o.impact : 0), 
              0
            )
          },
          insights
        };

        setResult(result);
        updateStats(result.statChanges);
      }
    } catch (error) {
      console.error('Error processing response:', error);
      setFeedback('I apologize, but I cannot analyze your response at the moment.');
    }
  }, [selectedActivity, yokai, currentStep, userResponses, aiService, updateStats]);

  return {
    selectedActivity,
    userResponses,
    currentStep,
    result,
    feedback,
    handleActivitySelect,
    handleResponseSubmit,
    setUserResponses
  };
}