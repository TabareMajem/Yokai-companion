import { useState, useEffect } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Progress } from '../../../components/ui/Progress';
import { Volume2, VolumeX, Pause, Play } from 'lucide-react';
import { MindfulnessExercise as IMindfulnessExercise } from '../types';
import { useAudioPlayback } from '../../../hooks/useAudioPlayback';

interface Props {
  exercise: IMindfulnessExercise;
  onComplete: (insights: string[]) => void;
  onCancel: () => void;
}

export function MindfulnessExercise({ exercise, onComplete, onCancel }: Props) {
  const [isPaused, setIsPaused] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'intro' | 'main' | 'closure'>('intro');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [insights, setInsights] = useState<string[]>([]);
  const { isPlaying, playAudio } = useAudioPlayback();

  useEffect(() => {
    if (!isPaused) {
      const timer = setInterval(() => {
        setTimeElapsed(prev => {
          const next = prev + 1;
          if (next >= exercise.duration * 60) {
            clearInterval(timer);
            onComplete(insights);
          }
          return next;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isPaused, exercise.duration, insights, onComplete]);

  const progress = (timeElapsed / (exercise.duration * 60)) * 100;
  const minutes = Math.floor(timeElapsed / 60);
  const seconds = timeElapsed % 60;

  const getCurrentContent = () => {
    switch (currentPhase) {
      case 'intro':
        return exercise.structure.introduction;
      case 'main':
        return exercise.structure.mainPractice.join('\n\n');
      case 'closure':
        return exercise.structure.closure;
    }
  };

  const handlePlayGuidance = async () => {
    try {
      const content = getCurrentContent();
      // This would use the MindfulnessGenerator service in a real implementation
      const utterance = new SpeechSynthesisUtterance(content);
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error playing guidance:', error);
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900">
          Mindfulness Exercise - {exercise.focus}
        </h3>
        <p className="mt-2 text-gray-600">
          Focus on {exercise.focus} with gentle awareness
        </p>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </span>
          <span className="text-sm text-gray-500">
            {exercise.duration}:00
          </span>
        </div>
        <Progress value={progress} className="mt-2" />
      </div>

      <div className="space-y-6">
        <div className="rounded-lg bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">
              Current Guidance
            </h4>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPaused(!isPaused)}
              >
                {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePlayGuidance}
                disabled={isPlaying}
              >
                {isPlaying ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-600">{getCurrentContent()}</p>
        </div>

        <div className="rounded-lg bg-indigo-50 p-4">
          <h4 className="text-sm font-medium text-indigo-900">Guidance</h4>
          <ul className="mt-2 space-y-2 text-sm text-indigo-800">
            <li>{exercise.guidance.posture}</li>
            <li>{exercise.guidance.attention}</li>
            <li>{exercise.guidance.breathing}</li>
          </ul>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onCancel}>
            End Session
          </Button>
          <Button
            onClick={() => onComplete(insights)}
            variant="outline"
          >
            Complete Early
          </Button>
        </div>
      </div>
    </Card>
  );
}