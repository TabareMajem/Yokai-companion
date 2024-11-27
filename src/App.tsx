import { useYokaiStore } from './store/yokaiStore';
import { ACTIVITIES } from './data/activities';
import { ActivityGrid } from './components/activities/ActivityGrid';
import { StatDisplay } from './components/stats/StatDisplay';
import { ChatInterface } from './components/chat/ChatInterface';
import { CBTExerciseInterface } from './components/cbt/CBTExerciseInterface';
import { MoodRecognitionSystem } from './components/mood/MoodRecognitionSystem';
import { Activity } from './types/interaction';
import { useState, useEffect } from 'react';

function App() {
  const { yokai, updateStats, updateRelationship, initializeYokai } = useYokaiStore();
  const [disabledActivities] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!yokai) {
      initializeYokai({
        id: '1',
        name: 'Spirit Guide',
        evolutionStage: 1,
        relationshipLevel: 1,
        traits: [],
        stats: {
          wisdom: 10,
          empathy: 10,
          energy: 100,
          happiness: 50
        },
        appearance: {
          primaryColor: '#4F46E5',
          secondaryColor: '#818CF8',
          pattern: 'spiral',
          size: 1,
          aura: 'calm'
        },
        createdAt: new Date(),
        lastInteraction: new Date()
      });
    }
  }, [yokai, initializeYokai]);

  const handleActivitySelect = async (activity: Activity) => {
    if (!yokai) return;

    const { rewards } = activity;
    updateStats({
      wisdom: (rewards.wisdom || 0),
      empathy: (rewards.empathy || 0),
      energy: (rewards.energy || 0) - activity.energyCost,
      happiness: (rewards.happiness || 0),
    });

    if (rewards.relationshipPoints) {
      updateRelationship(yokai.relationshipLevel + rewards.relationshipPoints);
    }
  };

  if (!yokai) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {yokai.name} - Level {yokai.evolutionStage}
          </h1>
          <p className="text-gray-600">
            Relationship Level: {yokai.relationshipLevel}
          </p>
        </div>

        <StatDisplay stats={yokai.stats} />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="space-y-8">
            <div>
              <h2 className="mb-4 text-2xl font-semibold text-gray-900">Chat</h2>
              <ChatInterface />
            </div>
            <div>
              <h2 className="mb-4 text-2xl font-semibold text-gray-900">Mood Recognition</h2>
              <MoodRecognitionSystem />
            </div>
            <div>
              <h2 className="mb-4 text-2xl font-semibold text-gray-900">CBT Exercises</h2>
              <CBTExerciseInterface />
            </div>
          </div>
          
          <div>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Activities</h2>
            <ActivityGrid
              activities={ACTIVITIES}
              onSelectActivity={handleActivitySelect}
              disabledActivities={disabledActivities}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;