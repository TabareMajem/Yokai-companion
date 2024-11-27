import { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Activity, UserPreferences } from '../types';
import { useBehavioralActivation } from '../hooks/useBehavioralActivation';
import { Volume2, VolumeX, Calendar, Clock } from 'lucide-react';
import * as Tabs from '@radix-ui/react-tabs';
import * as Switch from '@radix-ui/react-switch';

export function ActivityPlanner() {
  const [preferences, setPreferences] = useState<UserPreferences>({
    preferredTimes: {
      morning: true,
      afternoon: true,
      evening: true
    },
    energyPattern: {},
    interests: [],
    limitations: [],
    supportSystem: []
  });

  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const {
    activities,
    isGenerating,
    generateActivities,
    playActivityGuidance
  } = useBehavioralActivation();

  const handleGenerateActivities = async () => {
    try {
      await generateActivities(preferences, 100, 120);
    } catch (error) {
      console.error('Error generating activities:', error);
    }
  };

  const handlePlayGuidance = async (activity: Activity) => {
    try {
      await playActivityGuidance(activity);
    } catch (error) {
      console.error('Error playing guidance:', error);
    }
  };

  return (
    <Card className="p-6">
      <Tabs.Root defaultValue="preferences">
        <Tabs.List className="mb-6 flex border-b">
          <Tabs.Trigger
            value="preferences"
            className="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-600"
          >
            Preferences
          </Tabs.Trigger>
          <Tabs.Trigger
            value="activities"
            className="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-600"
          >
            Activities
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="preferences" className="space-y-6">
          <div>
            <h4 className="mb-2 text-sm font-medium text-gray-700">
              Preferred Times
            </h4>
            <div className="space-y-2">
              {Object.entries(preferences.preferredTimes).map(([time, enabled]) => (
                <div key={time} className="flex items-center justify-between">
                  <label className="text-sm text-gray-600 capitalize">
                    {time}
                  </label>
                  <Switch.Root
                    checked={enabled}
                    onCheckedChange={(checked) =>
                      setPreferences(prev => ({
                        ...prev,
                        preferredTimes: {
                          ...prev.preferredTimes,
                          [time]: checked
                        }
                      }))
                    }
                    className="h-6 w-11 rounded-full bg-gray-200 data-[state=checked]:bg-indigo-600"
                  >
                    <Switch.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white transition-transform duration-100 will-change-transform data-[state=checked]:translate-x-[22px]" />
                  </Switch.Root>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-medium text-gray-700">
              Interests
            </h4>
            <input
              type="text"
              placeholder="Add interests (comma-separated)"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              value={preferences.interests.join(', ')}
              onChange={(e) =>
                setPreferences(prev => ({
                  ...prev,
                  interests: e.target.value.split(',').map(i => i.trim())
                }))
              }
            />
          </div>

          <Button
            onClick={handleGenerateActivities}
            disabled={isGenerating}
            className="w-full"
          >
            Generate Activities
          </Button>
        </Tabs.Content>

        <Tabs.Content value="activities" className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="rounded-lg border border-gray-200 p-4 hover:border-indigo-200"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{activity.name}</h4>
                  <p className="mt-1 text-sm text-gray-600">
                    {activity.description}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {activity.duration}m
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-medium text-gray-700">
                    Preparation
                  </h5>
                  <ul className="mt-1 list-inside list-disc text-sm text-gray-600">
                    {activity.preparation.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-700">
                    Solutions
                  </h5>
                  <ul className="mt-1 list-inside list-disc text-sm text-gray-600">
                    {activity.solutions.map((solution, index) => (
                      <li key={index}>{solution}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePlayGuidance(activity)}
                >
                  <Volume2 className="mr-2 h-4 w-4" />
                  Play Guidance
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedActivity(activity)}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule
                </Button>
              </div>
            </div>
          ))}
        </Tabs.Content>
      </Tabs.Root>
    </Card>
  );
}