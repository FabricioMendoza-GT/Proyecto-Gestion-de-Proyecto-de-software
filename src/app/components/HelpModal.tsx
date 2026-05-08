import { X, BookOpen, Info } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <h2>Guía de Uso</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Primeros pasos. */}
          <section>
            <h3 className="flex items-center gap-2 mb-3">
              <Info className="w-5 h-5 text-blue-500" />
              Cómo Empezar
            </h3>
            <div className="bg-blue-50 rounded-lg p-4 space-y-2 text-sm">
              <p><strong>1. Seleccionar tamaño:</strong> Elige un tamaño de matriz predefinido o personalízalo agregando/eliminando filas y columnas.</p>
              <p><strong>2. Ingresar datos:</strong> Completa los costos de transporte, la oferta de cada origen y la demanda de cada destino.</p>
              <p><strong>3. Verificar balance:</strong> Asegúrate que la suma de ofertas sea igual a la suma de demandas.</p>
              <p><strong>4. Seleccionar método:</strong> Escoge el algoritmo que deseas usar.</p>
              <p><strong>5. Resolver:</strong> Presiona "Resolver" para ver los resultados.</p>
            </div>
          </section>

          {/* Explicación de los métodos disponibles. */}
          <section>
            <h3 className="mb-3">Métodos Disponibles</h3>
            <div className="space-y-4">
              <div className="border border-slate-200 rounded-lg p-4">
                <h4 className="text-blue-600 mb-2">Método de la Esquina Noroeste</h4>
                <p className="text-sm text-slate-600 mb-2">
                  Comienza en la celda superior izquierda (esquina noroeste) y asigna la mayor cantidad posible. Luego se mueve hacia la derecha o hacia abajo dependiendo de qué se agote primero (oferta o demanda).
                </p>
                <div className="text-xs text-slate-500">
                  ✓ Simple y rápido | ✗ No garantiza la solución óptima
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-4">
                <h4 className="text-green-600 mb-2">Método de Costo Mínimo</h4>
                <p className="text-sm text-slate-600 mb-2">
                  Selecciona siempre la celda con el costo unitario más bajo disponible y asigna la mayor cantidad posible. Continúa hasta satisfacer toda la oferta y demanda.
                </p>
                <div className="text-xs text-slate-500">
                  ✓ Mejor que esquina noroeste | ✓ Considera costos | ✗ No siempre óptimo
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-4">
                <h4 className="text-purple-600 mb-2">Método de Aproximación de Vogel (VAM)</h4>
                <p className="text-sm text-slate-600 mb-2">
                  Calcula "penalizaciones" para cada fila y columna (diferencia entre los dos costos más bajos). Selecciona la fila/columna con mayor penalización y asigna en la celda de menor costo.
                </p>
                <div className="text-xs text-slate-500">
                  ✓ Generalmente óptimo o muy cercano | ✓ Mejor calidad | ✗ Más complejo
                </div>
              </div>
            </div>
          </section>

          {/* Consejos prácticos para usar la herramienta. */}
          <section>
            <h3 className="mb-3">Consejos</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex gap-2">
                <span className="text-blue-500">•</span>
                <span>Si el problema no está balanceado, agrega una fila o columna ficticia con costo 0.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-500">•</span>
                <span>Usa el modo "Comparación" para ver qué método ofrece el mejor costo.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-500">•</span>
                <span>El modo "Paso a paso" es ideal para entender cómo funciona cada algoritmo.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-500">•</span>
                <span>Puedes exportar tus resultados para guardar o compartir tus soluciones.</span>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
