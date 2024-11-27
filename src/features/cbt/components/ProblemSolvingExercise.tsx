import { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { ProblemSolvingExercise, ProblemSolvingStep } from '../types/problemSolving';
import { ExerciseProgress } from '../../../components/cbt/ExerciseProgress';
import { useExerciseProgress } from '../hooks/useExerciseProgress';
import { Volume2, VolumeX } from 'lucide-react';
import { useAudioPlayback } from '../../../hooks/useAudioPlayback';

interface Props {
  exercise: ProblemSolvingExercise;
  onComplete: (responses: string[]) => void;
  onCancel: () => void;
}

export function ProblemSolvingExercise({ exercise, onComplete, onCancel }: Props) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [responses, setResponses] = useState<string[]>([]);
  const { isPlaying, playAudio } = useAudioPlayback();
  const { progress, formattedTime, isTimeUp } = useExerciseProgress({
    activity: exercise,
    currentStep: currentStepIndex
  });

  const currentStep = exercise.steps[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < exercise.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      onComplete(responses);
    }
  };

  const handleResponseChange = (value: string) => {
    const newResponses = [...responses];
    newResponses[currentStepIndex] = value;
    setResponses(newResponses);
  };

  const handlePlayGuidance = async () => {
    try {
      // This would use the AIService to generate and play audio
      // For now, we'll use the browser's speech synthesis
      const utterance = new SpeechSynthesisUtterance(currentStep.guidance);
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error playing guidance:', error);
    }
  };

  if (isTimeUp) {
    onComplete(responses);
    return null;
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900">
          Problem-Solving Exercise
        </h3>
        <p className="mt-2 text-gray-600">{exercise.problem.description}</p>
      </div>

      <ExerciseProgress
        currentStep={currentStepIndex}
        totalSteps={exercise.steps.length}
        timeSpent={0}
        timeLimit={exercise.duration * 60 * 1000}
      />

      <div className="mt-6 space-y-6">
        <div className="rounded-lg bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">
              Phase: {currentStep.phase}
            </h4>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePlayGuidance}
              disabled={isPlaying}
            >
              {isPlaying ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>
          <p className="mt-2 text-sm text-gray-600">{currentStep.guidance}</p>
        </div>

        <div className="space-y-4">
          {currentStep.prompts.map((prompt, index) => (
            <div key={index}>
              <p className="mb-2 text-sm font-medium text-gray-700">{prompt}</p>
              <textarea
                className="w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                rows={4}
                value={responses[currentStepIndex] || ''}
                onChange={(e) => handleResponseChange(e.target.value)}
                placeholder="Enter your response..."
              />
            </div>
          ))}
        </div>

        <div className="mt-4">
          <h5 className="text-sm font-medium text-gray-700">Completion Criteria:</h5>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-600">
            {currentStep.completionCriteria.map((criteria, index) => (
              <li key={index}>{criteria}</li>
            ))}
          </ul>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onCancel}>
            Cancel Exercise
          </Button>
          <Button
            onClick={handleNext}
            disabled={!responses[currentStepIndex]}
          >
            {currentStepIndex < exercise.steps.length - 1 ? 'Next Step' : 'Complete Exercise'}
          </Button>
        </div>
      </div>
    </Card>
  );
}