import { useState, useCallback } from 'react';
import { ExposureHierarchyBuilder } from '../services/ExposureHierarchyBuilder';
import { ExposureHierarchy, ExposureContext } from '../types/exposure';
import { useYokaiStore } from '../../../store/yokaiStore';

export function useExposureHierarchy() {
  const [hierarchy, setHierarchy] = useState<ExposureHierarchy | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const { yokai } = useYokaiStore();
  const builder = new ExposureHierarchyBuilder();

  const buildHierarchy = useCallback(async (
    target: string,
    context: Partial<ExposureContext> = {}
  ) => {
    if (!yokai) return;

    setIsBuilding(true);
    try {
      const exposureContext: ExposureContext = {
        currentAnxiety: context.currentAnxiety || 50,
        previousExposures: context.previousExposures || [],
        availableSupport: context.availableSupport || ['Self-guided'],
        preferredCopingStrategies: context.preferredCopingStrategies || [
          'Deep breathing',
          'Grounding'
        ],
        environmentalFactors: context.environmentalFactors || ['Home setting']
      };

      const newHierarchy = await builder.buildHierarchy(target, exposureContext);
      setHierarchy(newHierarchy);
      return newHierarchy;
    } catch (error) {
      console.error('Error building hierarchy:', error);
      throw error;
    } finally {
      setIsBuilding(false);
    }
  }, [yokai]);

  return {
    hierarchy,
    isBuilding,
    buildHierarchy
  };
}