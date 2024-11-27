import { Activity } from '../../types/interaction';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Clock, Battery, Sparkles } from 'lucide-react';

interface ActivityCardProps {
  activity: Activity;
  onSelect: (activity: Activity) => void;
  disabled?: boolean;
}

export function ActivityCard({ activity, onSelect, disabled }: ActivityCardProps) {
  return (
    <Card
      variant="hover"
      className="flex flex-col gap-4"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{activity.name}</h3>
          <p className="text-sm text-gray-600">{activity.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span>{activity.duration}m</span>
        </div>
        <div className="flex items-center gap-1">
          <Battery className="h-4 w-4" />
          <span>-{activity.energyCost}</span>
        </div>
        {activity.rewards.relationshipPoints && (
          <div className="flex items-center gap-1">
            <Sparkles className="h-4 w-4" />
            <span>+{activity.rewards.relationshipPoints}</span>
          </div>
        )}
      </div>

      <Button
        onClick={() => onSelect(activity)}
        disabled={disabled}
        className="mt-auto"
      >
        Start Activity
      </Button>
    </Card>
  );
}