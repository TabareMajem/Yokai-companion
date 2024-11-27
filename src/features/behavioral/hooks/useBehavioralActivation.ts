import { useState, useCallback } from 'react';
import { BehavioralActivationService } from '../services/BehavioralActivationService';
import { Activity, UserPreferences, ActivitySchedule } from '../types';
import { useYokaiStore } from '../../../store/yokaiStore';
import { useMemorySystem } from '../../../hooks/useMemorySystem';
import { useAudioPlayback } from '../../../hooks/useAudioPlayback';

export function useBehavioralActivation() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [schedule, setSchedule] = useState<ActivitySchedule | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { yokai } = useYokaiStore();
  const { memoryManager, isInitialized } = useMemorySystem();
  const { playAudio } = useAudioPlayback();
  const [service, setService] = useState<BehavioralActivationService | null>(null);

  const initialize = useCallback(() => {
    if (isInitialized && memoryManager && !service) {
      setService(new BehavioralActivationService(memoryManager));
    }
  }, [isInitialized, memoryManager, service]);

  const generateActivities = useCallback(async (
    preferences: UserPreferences,
    energyLevel: number,
    timeAvailable: number
  ) => {
    if (!service || !yokai) return;

    setIsGenerating(true);
    try {
      const newActivities = await service.generateActivities(
        preferences,
        energyLevel,
        timeAvailable
      );
      setActivities(newActivities);
      return newActivities;
    } catch (error) {
      console.error('Error generating activities:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [service, yokai]);

  const generateSchedule = useCallback(async (
    selectedActivities: Activity[],
    preferences: UserPreferences
  ) => {
    if (!service) return;

    setIsGenerating(true);
    try {
      const newSchedule = await service.generateSchedule(
        selectedActivities,
        preferences
      );
      setSchedule(newSchedule);
      return newSchedule;
    } catch (error) {
      console.error('Error generating schedule:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [service]);

  const playActivityGuidance = useCallback(async (
    activity: Activity
  ) => {
    if (!service) return;

    try {
      const audioData = await service.generateGuidance(activity);
      await playAudio(audioData);
    } catch (error) {
      console.error('Error playing activity guidance:', error);
      throw error;
    }
  }, [service, playAudio]);

  return {
    activities,
    schedule,
    isGenerating,
    initialize,
    generateActivities,
    generateSchedule,
    playActivityGuidance
  };
}