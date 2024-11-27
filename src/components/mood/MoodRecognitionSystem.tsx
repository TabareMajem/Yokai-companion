import { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useMoodTracking } from '../../features/mood/hooks/useMoodTracking';
import { MoodTracker } from './MoodTracker';
import { MoodAnalysisDisplay } from './MoodAnalysisDisplay';
import { TherapeuticResponseDisplay } from './TherapeuticResponseDisplay';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';

export function MoodRecognitionSystem() {
  const [activeTab, setActiveTab] = useState('track');
  const { entries, analysis, response, isAnalyzing, addEntry } = useMoodTracking();

  return (
    <Card className="p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 flex border-b">
          <TabsTrigger
            value="track"
            className="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-600"
          >
            Track Mood
          </TabsTrigger>
          <TabsTrigger
            value="analysis"
            className="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-600"
          >
            Analysis
          </TabsTrigger>
          <TabsTrigger
            value="insights"
            className="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-600"
          >
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="track">
          <MoodTracker onMoodSubmit={addEntry} />
        </TabsContent>

        <TabsContent value="analysis">
          {analysis && <MoodAnalysisDisplay analysis={analysis} isLoading={isAnalyzing} />}
        </TabsContent>

        <TabsContent value="insights">
          {response && <TherapeuticResponseDisplay response={response} />}
        </TabsContent>
      </Tabs>
    </Card>
  );
}