import { SchedulingResult, ScheduledActivity, TimeRange } from '../types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Calendar, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface Props {
  schedule: SchedulingResult;
  onActivitySelect: (activity: ScheduledActivity) => void;
}

export function ScheduleView({ schedule, onActivitySelect }: Props) {
  const formatTimeRange = (range: TimeRange) => {
    const formatHour = (hour: number) => {
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}${period}`;
    };
    return `${formatHour(range.start)} - ${formatHour(range.end)}`;
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900">
          Activity Schedule
        </h3>
        {schedule.conflicts.length > 0 && (
          <div className="mt-2 rounded-lg bg-yellow-50 p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <p className="text-sm text-yellow-700">
                {schedule.conflicts[0]}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {schedule.activities.map(activity => (
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
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{formatTimeRange(schedule.timeSlots[activity.id])}</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium text-gray-700">Preparation</h5>
                <ul className="mt-1 list-inside list-disc text-gray-600">
                  {activity.preparation.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-gray-700">Support</h5>
                <ul className="mt-1 list-inside list-disc text-gray-600">
                  {activity.accountability.map((support, index) => (
                    <li key={index}>{support}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onActivitySelect(activity)}
                className="w-full"
              >
                View Details
              </Button>
            </div>
          </div>
        ))}
      </div>

      {schedule.suggestions.length > 0 && (
        <div className="mt-6 rounded-lg bg-indigo-50 p-4">
          <h4 className="font-medium text-indigo-900">Suggestions</h4>
          <ul className="mt-2 space-y-2 text-sm text-indigo-800">
            {schedule.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}