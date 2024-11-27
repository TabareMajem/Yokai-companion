import { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Smile, Frown, Meh, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useYokaiStore } from '../../store/yokaiStore';
import { useAICompanion } from '../../hooks/useAICompanion';
import { useMemorySystem } from '../../hooks/useMemorySystem';

export function MoodTracker() {
  const [mood, setMood] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(5);
  const [notes, setNotes] = useState('');
  const { yokai, updateStats } = useYokaiStore();
  const { interact, isProcessing } = useAICompanion();
  const { storeMemory } = useMemorySystem();

  const moods = [
    { name: 'happy', icon: Smile },
    { name: 'sad', icon: Frown },
    { name: 'neutral', icon: Meh },
    { name: 'excited', icon: ThumbsUp },
    { name: 'anxious', icon: ThumbsDown }
  ];

  const handleSubmit = async () => {
    if (!mood || !yokai) return;

    try {
      // Store mood in memory system
      await storeMemory(
        `Mood: ${mood} (${intensity}/10) - ${notes}`,
        'emotion',
        {
          mood,
          intensity,
          notes
        },
        intensity >= 8 ? 8 : 5
      );

      // Generate AI response with voice
      const response = await interact(
        `The user is feeling ${mood} with intensity ${intensity}. Notes: ${notes}`,
        {
          currentMood: mood,
          intensity,
          previousMood: yokai.stats.happiness > 70 ? 'positive' : 'neutral',
          context: notes
        }
      );

      // Update stats based on mood
      updateStats({
        happiness: intensity > 5 ? 2 : -2,
        energy: intensity > 7 ? -1 : 1
      });

      // Reset form
      setMood(null);
      setIntensity(5);
      setNotes('');
    } catch (error) {
      console.error('Error processing mood:', error);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="mb-6 text-xl font-semibold text-gray-900">How are you feeling?</h3>
      
      <div className="space-y-6">
        <div className="flex justify-around">
          {moods.map(({ name, icon: Icon }) => (
            <button
              key={name}
              onClick={() => setMood(name)}
              className={`rounded-lg p-4 transition-colors ${
                mood === name 
                  ? 'bg-indigo-100 text-indigo-600' 
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="h-8 w-8" />
              <span className="mt-2 block text-sm capitalize">{name}</span>
            </button>
          ))}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Intensity: {intensity}
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Additional Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What's on your mind?"
            className="h-24 w-full rounded-lg border border-gray-300 p-3 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!mood || isProcessing}
          className="w-full"
        >
          Share Mood
        </Button>
      </div>
    </Card>
  );
}