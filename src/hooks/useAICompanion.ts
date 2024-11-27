import { useState, useCallback, useEffect } from 'react';
import { AIService } from '../services/AIService';
import { useMemorySystem } from './useMemorySystem';
import { useAudioPlayback } from './useAudioPlayback';
import { useYokaiStore } from '../store/yokaiStore';

export function useAICompanion() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { yokai } = useYokaiStore();
  const { memoryManager, isInitialized } = useMemorySystem();
  const { playAudio } = useAudioPlayback();
  const [aiService, setAIService] = useState<AIService | null>(null);

  useEffect(() => {
    if (isInitialized && memoryManager && !aiService) {
      setAIService(new AIService(memoryManager));
    }
  }, [isInitialized, memoryManager, aiService]);

  const interact = useCallback(async (
    input: string,
    context: Record<string, unknown> = {}
  ) => {
    if (!aiService || !yokai) return null;

    setIsProcessing(true);
    try {
      const response = await aiService.generateResponse(input, {
        ...context,
        userId: yokai.id,
        evolutionStage: yokai.evolutionStage,
        relationshipLevel: yokai.relationshipLevel
      });

      const audioData = await aiService.generateSpeech(response);
      await playAudio(audioData);

      return response;
    } catch (error) {
      console.error('Error during AI interaction:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [aiService, yokai, playAudio]);

  return {
    interact,
    isProcessing,
    isReady: Boolean(aiService && isInitialized)
  };
}