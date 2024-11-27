import { useState, useCallback } from 'react';
import { ActivityScheduler } from '../services/ActivityScheduler';
import { 
  SchedulingResult, 
  UserPreferences, 
  TimeCommitment 
} from '../types';
import { useYokaiStore } from '../../../store/yokaiStore';
import { useAudioPlayback } from '../../../hooks/useAudioPlayback';

export function useActivityScheduler() {
  const [schedule, setSchedule] = useState<SchedulingResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { yokai } = useYokaiStore();
  const { playAudio } = useAudioPlayback();
  const scheduler = new ActivityScheduler();

  const generateSchedule = useCallback(async (
    preferences: UserPreferences,
    commitments: TimeCommitment[]
  ) => {
    if (!yokai) return;

    setIsGenerating(true);
    try {
      const newSchedule = await scheduler.generateSchedule(
        preferences,
        commitments
      );
      setSchedule(newSchedule);

      // Generate and play audio briefing
      const audioBriefing = await scheduler.generateAudioBriefing(newSchedule);
      await playAudio(audioBriefing);

      return newSchedule;
    } catch (error) {
      console.error('Error generating schedule:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [yokai, scheduler, playAudio]);

  return {
    schedule,
    isGenerating,
    generateSchedule
  };
}