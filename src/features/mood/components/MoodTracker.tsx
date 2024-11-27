import { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Emotion, MoodEntry } from '../types';
import { Smile, Frown, Meh, ThumbsUp, ThumbsDown } from 'lucide-react';

interface Props {
  onMoodSubmit: (entry: MoodEntry) => void;
}

export function MoodTracker({ onMoodSubmit }: Props) {
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);
  const [intensity, setIntensity] = useState(5);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const emotions: Array<{ emotion: Emotion; icon: typeof Smile }> = [
    { emotion: 'joy', icon: Smile },
    { emotion: 'sadness', icon: Frown },
    { emotion: 'contentment', icon: Meh },
    { emotion: 'excitement', icon: ThumbsUp },
    { emotion: 'anxiety', icon: ThumbsDown }
  ];

  const handleSubmit = () => {
    if (!selectedEmotion) return;

    const entry: MoodEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      primary: selectedEmotion,
      secondary: [],
      intensity,
      triggers,
      context: {
        location: 'home',
        activity: 'tracking mood',
        socialContext: []
      },
      notes
    };

    onMoodSubmit(entry);
    resetForm();
  };

  const resetForm = () => {
    setSelectedEmotion(null);
    setIntensity(5);
    setTriggers([]);
    setNotes('');
  };

  return (
    <Card className="p-6">
      <h3 className="mb-4 text-xl font-semibold text-gray-900">
        How are you feeling?
      </h3>

      <div className="space-y-6">
        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-700">
            Select your mood
          </h4>
          <div className="flex gap-4">
            {emotions.map(({ emotion, icon: Icon }) => (
              <button
                key={emotion}
                onClick={() => setSelectedEmotion(emotion)}
                className={`rounded-lg p-3 transition-colors ${
                  selectedEmotion === emotion
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-6 w-6" />
                <span className="mt-1 block text-xs capitalize">{emotion}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-700">
            Intensity: {intensity}
          </h4>
          <input
            type="range"
            min="1"
            max="10"
            value={intensity}
            onChange={(e) => setIntensity(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-700">
            What triggered this feeling?
          </h4>
          <input
            type="text"
            placeholder="Enter triggers (comma-separated)"
            value={triggers.join(', ')}
            onChange={(e) => setTriggers(e.target.value.split(',').map(t => t.trim()))}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-700">
            Additional Notes
          </h4>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How are you feeling? What's on your mind?"
            className="h-24 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={resetForm}>
            Reset
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedEmotion}
          >
            Save Entry
          </Button>
        </div>
      </div>
    </Card>
  );
}