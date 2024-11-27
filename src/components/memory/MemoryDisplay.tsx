import { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { Memory } from '../../types/memory';
import { format } from 'date-fns';
import { Brain, Clock, Star } from 'lucide-react';

interface Props {
  memories: Memory[];
  onMemorySelect?: (memory: Memory) => void;
}

export function MemoryDisplay({ memories, onMemorySelect }: Props) {
  const [groupedMemories, setGroupedMemories] = useState<Record<string, Memory[]>>({});

  useEffect(() => {
    const grouped = memories.reduce((acc, memory) => {
      const date = format(memory.timestamp, 'yyyy-MM-dd');
      if (!acc[date]) acc[date] = [];
      acc[date].push(memory);
      return acc;
    }, {} as Record<string, Memory[]>);

    setGroupedMemories(grouped);
  }, [memories]);

  return (
    <Card className="p-6">
      <h3 className="mb-6 text-xl font-semibold text-gray-900">Memory Archive</h3>

      <div className="space-y-8">
        {Object.entries(groupedMemories).map(([date, dayMemories]) => (
          <div key={date}>
            <h4 className="mb-4 text-sm font-medium text-gray-600">
              {format(new Date(date), 'MMMM d, yyyy')}
            </h4>

            <div className="space-y-4">
              {dayMemories.map((memory) => (
                <div
                  key={memory.id}
                  onClick={() => onMemorySelect?.(memory)}
                  className="cursor-pointer rounded-lg border border-gray-200 p-4 transition-colors hover:border-indigo-200 hover:bg-indigo-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {memory.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{format(memory.timestamp, 'HH:mm')}</span>
                      {memory.importance >= 8 && (
                        <Star className="h-4 w-4 text-yellow-400" />
                      )}
                    </div>
                  </div>

                  <p className="mt-2 text-gray-600">{memory.content}</p>

                  {Object.keys(memory.context).length > 0 && (
                    <div className="mt-2">
                      <h5 className="text-xs font-medium text-gray-500">Context</h5>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {Object.entries(memory.context).map(([key, value]) => (
                          <span
                            key={key}
                            className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
                          >
                            {key}: {String(value)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}