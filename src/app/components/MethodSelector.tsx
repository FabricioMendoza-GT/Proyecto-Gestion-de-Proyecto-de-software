import { CheckCircle2 } from 'lucide-react';

export type TransportMethod = 'northwest' | 'minimum-cost' | 'vogel';
export type SolutionMode = 'step-by-step' | 'comparison';

interface MethodSelectorProps {
  selectedMethod: TransportMethod;
  selectedMode: SolutionMode;
  onMethodChange: (method: TransportMethod) => void;
  onModeChange: (mode: SolutionMode) => void;
}

export function MethodSelector({
  selectedMethod,
  selectedMode,
  onMethodChange,
  onModeChange,
}: MethodSelectorProps) {
  const methods: { id: TransportMethod; name: string; description: string }[] = [
    {
      id: 'northwest',
      name: 'Esquina Noroeste',
      description: 'Comienza desde la celda superior izquierda',
    },
    {
      id: 'minimum-cost',
      name: 'Costo Mínimo',
      description: 'Selecciona siempre el costo más bajo disponible',
    },
    {
      id: 'vogel',
      name: 'Aproximación de Vogel',
      description: 'Calcula penalizaciones para optimizar la solución',
    },
  ];

  return (
    <div className="h-full flex flex-col justify-between gap-6">
      {/* Selección de método: diseño compacto y responsivo para evitar desbordes. */}
      <div className="flex-1">
        <h3 className="mb-3">Seleccionar Método</h3>
        <div className="flex flex-col gap-3">
          {methods.map((method) => (
            <button
              key={method.id}
              onClick={() => onMethodChange(method.id)}
              aria-pressed={selectedMethod === method.id}
              className={`w-full p-3 rounded-lg border-2 transition-all text-left relative flex items-start gap-3 min-h-[60px] md:min-h-[56px] ${
                selectedMethod === method.id
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'
              }`}
            >
              {selectedMethod === method.id && (
                <CheckCircle2 className="w-5 h-5 text-blue-500 absolute top-2 right-2" />
              )}
              <div className="flex-1">
                <div className="mb-0.5 text-sm font-medium leading-tight">{method.name}</div>
                <p className="text-xs text-slate-600 leading-snug whitespace-normal">{method.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selección del modo de solución. */}
      <div>
        <h3 className="mb-3">Modo de Solución</h3>
        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={() => onModeChange('step-by-step')}
            className={`w-full p-3 rounded-lg border-2 transition-all text-left relative flex items-start gap-3 min-h-[56px] ${
              selectedMode === 'step-by-step'
                ? 'border-green-500 bg-green-50 shadow-md'
                : 'border-slate-200 bg-white hover:border-green-300 hover:shadow-sm'
            }`}
          >
            {selectedMode === 'step-by-step' && (
              <CheckCircle2 className="w-5 h-5 text-green-500 absolute top-3 right-3" />
            )}
            <div className="flex-1">
              <div className="mb-1 font-medium">Paso a Paso</div>
              <p className="text-xs text-slate-600">Ver cada iteración con explicaciones</p>
            </div>
          </button>
          <button
            onClick={() => onModeChange('comparison')}
            className={`w-full p-3 rounded-lg border-2 transition-all text-left relative flex items-start gap-3 min-h-[56px] ${
              selectedMode === 'comparison'
                ? 'border-green-500 bg-green-50 shadow-md'
                : 'border-slate-200 bg-white hover:border-green-300 hover:shadow-sm'
            }`}
          >
            {selectedMode === 'comparison' && (
              <CheckCircle2 className="w-5 h-5 text-green-500 absolute top-3 right-3" />
            )}
            <div className="flex-1">
              <div className="mb-1 font-medium">Comparación</div>
              <p className="text-xs text-slate-600">Comparar todos los métodos</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

