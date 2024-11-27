import { CBTActivity } from '../../types/cbt';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Brain, Clock, Target } from 'lucide-react';

interface CBTActivityCardProps {
  activity: CBTActivity;
  onStart: (activity: CBTActivity) => void;
  disabled?: boolean;
}

export function CBTActivityCard({ 
  activity, 
  onStart, 
  disabled 
}: CBTActivityCardProps) {
  return (
    <Card variant="hover" className="flex flex-col gap-4">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {activity.type}
          </h3>
          <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-800">
            Level {activity.difficulty}
          </span>
        </div>
        <p className="mt-2 text-sm text-gray-600">{activity.objective}</p>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span>{activity.duration}m</span>
        </div>
        <div className="flex items-center gap-1">
          <Brain className="h-4 w-4" />
          <span>+{activity.outcomes.reduce((sum, o) => sum + o.impact, 0)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Target className="h-4 w-4" />
          <span>{activity.instructions.length} steps</span>
        </div>
      </div>

      <Button
        onClick={() => onStart(activity)}
        disabled={disabled}
        className="mt-auto"
      >
        Start Exercise
      </Button>
    </Card>
  );
}