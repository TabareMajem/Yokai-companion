import { Activity } from '../../types/interaction';
import { ActivityCard } from './ActivityCard';

interface ActivityGridProps {
  activities: Activity[];
  onSelectActivity: (activity: Activity) => void;
  disabledActivities?: Set<string>;
}

export function ActivityGrid({ 
  activities, 
  onSelectActivity,
  disabledActivities = new Set()
}: ActivityGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {activities.map((activity) => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          onSelect={onSelectActivity}
          disabled={disabledActivities.has(activity.id)}
        />
      ))}
    </div>
  );
}