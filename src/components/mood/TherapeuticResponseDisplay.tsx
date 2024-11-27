import { TherapeuticResponse } from '../../features/mood/types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Volume2, VolumeX, Lightbulb, Target } from 'lucide-react';
import { useAudioPlayback } from '../../hooks/useAudioPlayback';
import { useAICompanion } from '../../hooks/useAICompanion';

interface Props {
  response: TherapeuticResponse;
}

export function TherapeuticResponseDisplay({ response }: Props) {
  const { isPlaying, playAudio } = useAudioPlayback();
  const { interact, isProcessing } = useAICompanion();

  const handlePlayResponse = async () => {
    try {
      const audioResponse = await interact(response.content, { type: 'therapeutic' });
      if (audioResponse) {
        // Audio will be played automatically through the AI companion
      }
    } catch (error) {
      console.error('Error playing response:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Therapeutic Response
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePlayResponse}
            disabled={isPlaying || isProcessing}
          >
            {isPlaying ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="mt-4 text-gray-600">{response.content}</p>
      </Card>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Suggested Activities
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {response.suggestedActivities.map((activity, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 text-indigo-500 mt-1" />
                <div>
                  <p className="font-medium text-gray-900">{activity}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Coping Strategies
        </h4>
        <div className="space-y-3">
          {response.copingStrategies.map((strategy, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-4 bg-indigo-50 rounded-lg"
            >
              <Lightbulb className="h-5 w-5 text-indigo-500 mt-1" />
              <p className="text-indigo-900">{strategy}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}