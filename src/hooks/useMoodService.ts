import { useState, useCallback, useEffect } from 'react';
import { MoodService } from '../services/MoodService';
import { useMemorySystem } from './useMemorySystem';
import { useAudioPlayback } from './useAudioPlayback';
import { MoodEntry, MoodAnalysis, TherapeuticResponse } from '../features/mood/types';

export function useMoodService() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysis, setAnalysis] = useState<MoodAnalysis | null>(null);
  const [response, setResponse] = useState<TherapeuticResponse | null>(null);
  const { memoryManager, isInitialized } = useMemorySystem();
  const { playAudio } = useAudioPlayback();
  const [service, setService] = useState<MoodService | null>(null);

  useEffect(() => {
    if (isInitialized && memoryManager && !service) {
      setService(new MoodService(memoryManager));
    }
  }, [isInitialized, memoryManager, service]);

  const processMoodEntry = useCallback(async (entry: MoodEntry) => {
    if (!service) return;

    setIsProcessing(true);
    try {
      // Store mood entry in memory
      await memoryManager?.storeMemory({
        id: entry.id,
        userId: 'user',
        content: `Mood: ${entry.primary} (${entry.intensity}/10)`,
        type: 'emotion',
        timestamp: entry.timestamp,
        importance: entry.intensity >= 8 ? 8 : 5,
        context: entry
      });

      // Generate analysis and response
      const [newAnalysis, newResponse] = await Promise.all([
        service.analyzeMood(entry),
        service.generateResponse(entry, '')
      ]);

      setAnalysis(newAnalysis);
      setResponse(newResponse);

      // Generate and play audio response
      const audioData = await service.generateSpeech(newResponse.content);
      await playAudio(audioData);

      return { analysis: newAnalysis, response: newResponse };
    } catch (error) {
      console.error('Error processing mood entry:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [service, memoryManager, playAudio]);

  return {
    analysis,
    response,
    isProcessing,
    isReady: Boolean(service && isInitialized),
    processMoodEntry
  };
}