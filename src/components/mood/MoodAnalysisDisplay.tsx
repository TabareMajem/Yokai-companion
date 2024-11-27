import { MoodAnalysis } from '../../features/mood/types';
import { Card } from '../ui/Card';
import { Brain, TrendingUp, Zap } from 'lucide-react';

interface Props {
  analysis: MoodAnalysis;
  isLoading?: boolean;
}

export function MoodAnalysisDisplay({ analysis, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Analyzing mood patterns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Emotional Patterns
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysis.patterns.map((pattern, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-start gap-3">
                <Brain className="h-5 w-5 text-indigo-500 mt-1" />
                <div>
                  <h4 className="font-medium text-gray-900 capitalize">
                    {pattern.emotion}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Occurs {pattern.frequency} times
                    {pattern.averageIntensity > 7 ? ' with high intensity' : ''}
                  </p>
                  {pattern.commonTriggers.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-700">Common Triggers:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {pattern.commonTriggers.map((trigger, i) => (
                          <span
                            key={i}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                          >
                            {trigger}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Significant Triggers
        </h3>
        <div className="space-y-3">
          {analysis.triggers.map((trigger, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <Zap className="h-5 w-5 text-yellow-500" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{trigger.trigger}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-yellow-500 rounded-full"
                      style={{ width: `${trigger.impact * 10}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600">
                    Impact: {trigger.impact}/10
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recommendations
        </h3>
        <div className="space-y-3">
          {analysis.recommendations.map((recommendation, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-4 bg-indigo-50 rounded-lg"
            >
              <TrendingUp className="h-5 w-5 text-indigo-500 mt-1" />
              <p className="text-indigo-900">{recommendation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}