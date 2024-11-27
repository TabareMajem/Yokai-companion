import { useEffect, useState } from 'react';
import { Progress } from '../ui/Progress';
import { Clock } from 'lucide-react';

interface ExerciseProgressProps {
  currentStep: number;
  totalSteps: number;
  timeSpent: number;
  timeLimit: number;
}

export function ExerciseProgress({
  currentStep,
  totalSteps,
  timeSpent,
  timeLimit
}: ExerciseProgressProps) {
  const [timeLeft, setTimeLeft] = useState(timeLimit - timeSpent);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const progress = (currentStep / totalSteps) * 100;
  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          Step {currentStep + 1} of {totalSteps}
        </span>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>
            {minutes}:{seconds.toString().padStart(2, '0')}
          </span>
        </div>
      </div>
      <Progress value={progress} />
    </div>
  );
}