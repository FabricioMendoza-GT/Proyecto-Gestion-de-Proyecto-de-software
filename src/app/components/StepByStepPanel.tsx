import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

export interface Step {
  iteration: number;
  description: string;
  highlightedCells: { row: number; col: number }[];
  allocations: number[][];
  remainingSupply: number[];
  remainingDemand: number[];
  cost: number;
}

interface StepByStepPanelProps {
  steps: Step[];
  currentStep: number;
  onStepChange: (step: number) => void;
}

export function StepByStepPanel({ steps, currentStep, onStepChange }: StepByStepPanelProps) {
  if (steps.length === 0) return null;

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-md p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="mb-1">Iteración {currentStep + 1} / {steps.length}</h3>
          <div className="w-48 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onStepChange(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="p-2 rounded-lg border-2 border-slate-300 hover:bg-blue-50 hover:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => onStepChange(Math.min(steps.length - 1, currentStep + 1))}
            disabled={currentStep === steps.length - 1}
            className="p-2 rounded-lg border-2 border-slate-300 hover:bg-blue-50 hover:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border-2 border-yellow-200 shadow-sm">
        <div className="flex items-start gap-2">
          <div className="flex items-center justify-center w-6 h-6 bg-yellow-400 rounded-full flex-shrink-0 mt-0.5">
            <Play className="w-3 h-3 text-white" />
          </div>
          <p className="text-sm flex-1">{step.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="text-sm mb-3 flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            Oferta Restante
          </h4>
          <div className="flex flex-wrap gap-2">
            {step.remainingSupply.map((val, idx) => (
              <div
                key={idx}
                className={`px-3 py-1.5 rounded-md text-sm ${val === 0 ? 'bg-slate-200 text-slate-500 line-through' : 'bg-blue-200 text-blue-700'}`}
              >
                O{idx + 1}: {val}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <h4 className="text-sm mb-3 flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            Demanda Restante
          </h4>
          <div className="flex flex-wrap gap-2">
            {step.remainingDemand.map((val, idx) => (
              <div
                key={idx}
                className={`px-3 py-1.5 rounded-md text-sm ${val === 0 ? 'bg-slate-200 text-slate-500 line-through' : 'bg-green-200 text-green-700'}`}
              >
                D{idx + 1}: {val}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-200">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <span className="text-sm opacity-90">Costo Acumulado</span>
            <span className="text-3xl">${step.cost.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
