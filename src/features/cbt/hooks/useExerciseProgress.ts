import { useState, useEffect } from 'react';
import { CBTActivity } from '../types';

interface UseExerciseProgressProps {
  activity: CBTActivity | null;
  currentStep: number;
  startTime?: number;
}

export function useExerciseProgress({ 
  activity, 
  currentStep, 
  startTime = Date.now() 
}: UseExerciseProgressProps) {
  const [timeLeft, setTimeLeft] = useState(
    activity ? activity.duration * 60 * 1000 : 0
  );

  useEffect(() => {
    if (!activity) return;

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = (activity.duration * 60 * 1000) - elapsed;
      setTimeLeft(Math.max(0, remaining));
    }, 1000);

    return () => clearInterval(timer);
  }, [activity, startTime]);

  const progress = activity 
    ? (currentStep / activity.instructions.length) * 100 
    : 0;

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  return {
    progress,
    timeLeft,
    formattedTime: `${minutes}:${seconds.toString().padStart(2, '0')}`,
    isTimeUp: timeLeft === 0
  };
}