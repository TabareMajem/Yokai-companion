import { ExposureHierarchy } from '../types/exposure';
import { Card } from '../../../components/ui/Card';
import { Progress } from '../../../components/ui/Progress';
import { AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

interface Props {
  hierarchy: ExposureHierarchy;
  currentStep: number;
  completedSteps: number[];
  onStepSelect: (stepIndex: number) => void;
}

export function ExposureHierarchyView({
  hierarchy,
  currentStep,
  completedSteps,
  onStepSelect
}: Props) {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900">
          Exposure Hierarchy: {hierarchy.target}
        </h3>
        <p className="mt-2 text-gray-600">
          Progress: {completedSteps.length} / {hierarchy.steps.length} steps completed
        </p>
        <Progress 
          value={(completedSteps.length / hierarchy.steps.length) * 100}
          className="mt-2"
        />
      </div>

      <div className="space-y-4">
        {hierarchy.steps.map((step, index) => {
          const isCompleted = completedSteps.includes(index);
          const isCurrent = currentStep === index;
          const isAvailable = isCompleted || completedSteps.includes(index - 1);

          return (
            <div
              key={index}
              className={`rounded-lg border p-4 ${
                isCurrent ? 'border-indigo-500 bg-indigo-50' :
                isCompleted ? 'border-green-500 bg-green-50' :
                !isAvailable ? 'border-gray-200 bg-gray-50 opacity-50' :
                'border-gray-200 hover:border-indigo-200'
              }`}
              onClick={() => isAvailable && onStepSelect(index)}
              role="button"
              tabIndex={0}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : isCurrent ? (
                      <ArrowRight className="h-5 w-5 text-indigo-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-gray-400" />
                    )}
                    <h4 className="font-medium text-gray-900">
                      Step {index + 1}: {step.situation}
                    </h4>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Anxiety Level:</span>{' '}
                      {step.anticipatedAnxiety}/100
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span>{' '}
                      {step.duration} minutes
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div>
                  <h5 className="text-sm font-medium text-gray-700">Support:</h5>
                  <ul className="mt-1 list-inside list-disc text-sm text-gray-600">
                    {step.supports.map((support, i) => (
                      <li key={i}>{support}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-700">
                    Coping Strategies:
                  </h5>
                  <ul className="mt-1 list-inside list-disc text-sm text-gray-600">
                    {step.copingStrategies.map((strategy, i) => (
                      <li key={i}>{strategy}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-lg bg-yellow-50 p-4">
        <h4 className="font-medium text-yellow-800">Safety Guidelines</h4>
        <ul className="mt-2 list-inside list-disc text-sm text-yellow-700">
          {hierarchy.safetyGuidelines.map((guideline, index) => (
            <li key={index}>{guideline}</li>
          ))}
        </ul>
      </div>
    </Card>
  );
}