import { useState, useCallback } from 'react';
import { CBTActivity } from '../../types/cbt';
import { CBTActivityCard } from './CBTActivityCard';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useYokaiStore } from '../../store/yokaiStore';
import { CBT_ACTIVITIES } from '../../data/cbtActivities';
import { ExerciseProgress } from './ExerciseProgress';
import { Volume2, VolumeX } from 'lucide-react';
import { useAudioPlayback } from '../../hooks/useAudioPlayback';
import { useAICompanion } from '../../hooks/useAICompanion';

export function CBTExerciseInterface() {
  const [selectedActivity, setSelectedActivity] = useState<CBTActivity | null>(null);
  const [userResponses, setUserResponses] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [feedback, setFeedback] = useState<string>('');
  const { yokai, updateStats } = useYokaiStore();
  const { isPlaying, playAudio } = useAudioPlayback();
  const { interact, isProcessing, isReady } = useAICompanion();

  const handleActivitySelect = useCallback((activity: CBTActivity) => {
    setSelectedActivity(activity);
    setUserResponses([]);
    setCurrentStep(0);
    setFeedback('');
  }, []);

  const handleResponseSubmit = async (response: string) => {
    if (!selectedActivity || !yokai || !isReady) return;

    const newResponses = [...userResponses, response];
    setUserResponses(newResponses);

    try {
      // Generate AI response and feedback
      const analysis = await interact(
        `Analyze this CBT exercise response: ${response}`,
        {
          exerciseType: selectedActivity.type,
          difficulty: selectedActivity.difficulty,
          currentStep: selectedActivity.instructions[currentStep],
          objective: selectedActivity.objective
        }
      );

      if (analysis) {
        setFeedback(analysis);
      }

      if (currentStep < selectedActivity.instructions.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        // Update stats based on exercise completion
        const statChanges = {
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
        };

        updateStats(statChanges);
      }
    } catch (error) {
      console.error('Error analyzing response:', error);
      setFeedback('I apologize, but I cannot analyze your response at the moment.');
    }
  };

  if (!yokai) return null;

  if (selectedActivity) {
    return (
      <Card className="p-6">
        <h3 className="mb-4 text-xl font-semibold text-gray-900">
          {selectedActivity.type}
        </h3>
        <ExerciseProgress
          currentStep={currentStep}
          totalSteps={selectedActivity.instructions.length}
          timeSpent={0}
          timeLimit={selectedActivity.duration * 60 * 1000}
        />
        <div className="mt-6 space-y-4">
          <p className="text-gray-600">{selectedActivity.objective}</p>
          <div className="border-t border-b py-4">
            <p className="mb-2 text-sm font-medium text-gray-700">
              Step {currentStep + 1}: {selectedActivity.instructions[currentStep]}
            </p>
            <textarea
              className="mt-4 w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              rows={4}
              placeholder="Enter your response..."
              value={userResponses[currentStep] || ''}
              onChange={(e) => {
                const newResponses = [...userResponses];
                newResponses[currentStep] = e.target.value;
                setUserResponses(newResponses);
              }}
            />
          </div>
          {feedback && (
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700">Feedback</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => interact(feedback, { type: 'feedback' })}
                  disabled={isPlaying || isProcessing}
                >
                  {isPlaying ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-gray-600">{feedback}</p>
            </div>
          )}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setSelectedActivity(null)}
            >
              Cancel Exercise
            </Button>
            <Button
              onClick={() => handleResponseSubmit(userResponses[currentStep] || '')}
              disabled={!userResponses[currentStep] || isProcessing}
            >
              {currentStep < selectedActivity.instructions.length - 1 ? 'Next Step' : 'Complete Exercise'}
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {CBT_ACTIVITIES.map((activity) => (
        <CBTActivityCard
          key={activity.id}
          activity={activity}
          onStart={handleActivitySelect}
          disabled={!yokai || yokai.stats.energy < (activity.requiredStats.energy || 0)}
        />
      ))}
    </div>
  );
}