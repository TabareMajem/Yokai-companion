import { useState, useCallback } from 'react';
import { MoodEntry, MoodAnalysis, TherapeuticResponse } from '../types';
import { MoodAnalyzer } from '../services/MoodAnalyzer';
import { useYokaiStore } from '../../../store/yokaiStore';

export function useMoodTracking() {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [analysis, setAnalysis] = useState<MoodAnalysis | null>(null);
  const [response, setResponse] = useState<TherapeuticResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { yokai } = useYokaiStore();
  const analyzer = new MoodAnalyzer();

  const addEntry = useCallback(async (entry: MoodEntry) => {
    setEntries(prev => [...prev, entry]);

    if (!yokai) return;

    setIsAnalyzing(true);
    try {
      const recentEntries = entries.slice(-5);
      const therapeuticGoals = ['Improve emotional awareness', 'Develop coping strategies'];

      const [newAnalysis, newResponse] = await Promise.all([
        analyzer.analyzeMoodHistory(
          [...entries, entry],
          {
            start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            end: new Date()
          }
        ),
        analyzer.generateTherapeuticResponse(
          entry,
          recentEntries,
          therapeuticGoals
        )
      ]);

      setAnalysis(newAnalysis);
      setResponse(newResponse);
    } catch (error) {
      console.error('Error processing mood entry:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [entries, yokai, analyzer]);

  return {
    entries,
    analysis,
    response,
    isAnalyzing,
    addEntry
  };
}