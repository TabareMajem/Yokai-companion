import { Stats } from '../../types/yokai';
import { Brain, Heart, Battery, Smile } from 'lucide-react';
import { cn } from '../../utils/cn';

interface StatDisplayProps {
  stats: Stats;
  className?: string;
}

export function StatDisplay({ stats, className }: StatDisplayProps) {
  const statItems = [
    { icon: Brain, label: 'Wisdom', value: stats.wisdom },
    { icon: Heart, label: 'Empathy', value: stats.empathy },
    { icon: Battery, label: 'Energy', value: stats.energy },
    { icon: Smile, label: 'Happiness', value: stats.happiness },
  ];

  return (
    <div className={cn('grid grid-cols-2 gap-4 sm:grid-cols-4', className)}>
      {statItems.map(({ icon: Icon, label, value }) => (
        <div
          key={label}
          className="flex items-center gap-2 rounded-lg bg-white p-4 shadow-sm"
        >
          <Icon className="h-5 w-5 text-gray-600" />
          <div>
            <div className="text-sm font-medium text-gray-600">{label}</div>
            <div className="text-lg font-semibold text-gray-900">{value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}