import { PersonalityTrait } from '../../types/personality';
import { Card } from '../ui/Card';
import { Sparkles } from 'lucide-react';

interface TraitDisplayProps {
  trait: PersonalityTrait;
  isActive: boolean;
  onUnlock?: (trait: PersonalityTrait) => void;
  canUnlock: boolean;
}

export function TraitDisplay({ 
  trait, 
  isActive, 
  onUnlock,
  canUnlock 
}: TraitDisplayProps) {
  return (
    <Card
      className={`relative ${
        isActive ? 'border-2 border-indigo-500' : 'border border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {trait.name}
            {isActive && (
              <Sparkles className="ml-2 inline-block h-4 w-4 text-indigo-500" />
            )}
          </h3>
          <p className="mt-1 text-sm text-gray-600">{trait.description}</p>
        </div>
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700">Cultural Elements</h4>
        <ul className="mt-2 space-y-2">
          {trait.culturalElements.map((element) => (
            <li
              key={element.name}
              className="text-sm text-gray-600"
            >
              {element.name} - {element.description}
            </li>
          ))}
        </ul>
      </div>

      {!isActive && onUnlock && (
        <button
          onClick={() => onUnlock(trait)}
          disabled={!canUnlock}
          className={`mt-4 w-full rounded-lg px-4 py-2 text-sm font-medium ${
            canUnlock
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-gray-100 text-gray-400'
          }`}
        >
          {canUnlock ? 'Unlock Trait' : 'Requirements Not Met'}
        </button>
      )}
    </Card>
  );
}