/**
 * =====================================================================
 * COMPONENTE: Modal de Ayuda
 * 
 * Muestra información detallada sobre cómo usar la aplicación
 * y explicaciones de cada método de transporte.
 * 
 * CÓMO MODIFICAR:
 * - Para cambiar el contenido: modifique las secciones dentro del modal
 * - Para agregar más información: agregue nuevas secciones <section>
 * =====================================================================
 */
'use client';

import { X, BookOpen, Info } from 'lucide-react';

/* =====================================================================
   TIPOS/INTERFACES
   ===================================================================== */
interface PropsModalAyuda {
  /** Indica si el modal está visible */
  estaAbierto: boolean;
  /** Callback para cerrar el modal */
  alCerrar: () => void;
}

/* =====================================================================
   COMPONENTE PRINCIPAL
   ===================================================================== */
export function ModalAyuda({ estaAbierto, alCerrar }: PropsModalAyuda) {
  // No renderizar si está cerrado
  if (!estaAbierto) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* ===== ENCABEZADO ===== */}
        <div className="panel-header sticky top-0 bg-card border-b border-border p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Guía de Uso</h2>
          </div>
          <button
            onClick={alCerrar}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ===== CONTENIDO ===== */}
        <div className="p-6 space-y-6">
          {/* Sección: Cómo Empezar */}
          <section>
            <h3 className="flex items-center gap-2 mb-3 font-medium text-foreground">
              <Info className="w-5 h-5 text-blue-500" />
              Cómo Empezar
            </h3>
            <div className="section-box-light space-y-2 text-sm text-foreground">
              <p><strong>1. Seleccionar tamaño:</strong> Elige un tamaño de matriz predefinido o personalízalo agregando/eliminando filas y columnas.</p>
              <p><strong>2. Ingresar datos:</strong> Completa los costos de transporte, la oferta de cada origen y la demanda de cada destino.</p>
              <p><strong>3. Verificar balance:</strong> Asegúrate que la suma de ofertas sea igual a la suma de demandas.</p>
              <p><strong>4. Seleccionar método:</strong> Escoge el algoritmo que deseas usar.</p>
              <p><strong>5. Resolver:</strong> Presiona &quot;Resolver&quot; para ver los resultados.</p>
            </div>
          </section>

          {/* Sección: Métodos Disponibles */}
          <section>
            <h3 className="mb-3 font-medium text-foreground">Métodos Disponibles</h3>
            <div className="space-y-4">
              {/* Esquina Noroeste */}
              <div className="border border-border rounded-lg p-4">
                <h4 className="text-blue-600 font-medium mb-2">Método de la Esquina Noroeste</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Comienza en la celda superior izquierda (esquina noroeste) y asigna la mayor cantidad posible. 
                  Luego se mueve hacia la derecha o hacia abajo dependiendo de qué se agote primero (oferta o demanda).
                </p>
                <div className="text-xs text-muted-foreground">
                  ✓ Simple y rápido | ✗ No garantiza la solución óptima
                </div>
              </div>

              {/* Costo Mínimo */}
              <div className="border border-border rounded-lg p-4">
                <h4 className="text-green-600 font-medium mb-2">Método de Costo Mínimo</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Selecciona siempre la celda con el costo unitario más bajo disponible y asigna la mayor cantidad posible. 
                  Continúa hasta satisfacer toda la oferta y demanda.
                </p>
                <div className="text-xs text-muted-foreground">
                  ✓ Mejor que esquina noroeste | ✓ Considera costos | ✗ No siempre óptimo
                </div>
              </div>

              {/* Aproximación de Vogel */}
              <div className="border border-border rounded-lg p-4">
                <h4 className="text-blue-600 font-medium mb-2">Método de Aproximación de Vogel (VAM)</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Calcula &quot;penalizaciones&quot; para cada fila y columna (diferencia entre los dos costos más bajos). 
                  Selecciona la fila/columna con mayor penalización y asigna en la celda de menor costo.
                </p>
                <div className="text-xs text-muted-foreground">
                  ✓ Generalmente óptimo o muy cercano | ✓ Mejor calidad | ✗ Más complejo
                </div>
              </div>
            </div>
          </section>

          {/* Sección: Consejos */}
          <section>
            <h3 className="mb-3 font-medium text-foreground">Consejos</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-blue-500">•</span>
                <span>Si el problema no está balanceado, agrega una fila o columna ficticia con costo 0.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-500">•</span>
                <span>Usa el modo &quot;Comparación&quot; para ver qué método ofrece el mejor costo.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-500">•</span>
                <span>El modo &quot;Paso a paso&quot; es ideal para entender cómo funciona cada algoritmo.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-500">•</span>
                <span>Puedes exportar tus resultados para guardar o compartir tus soluciones.</span>
              </li>
            </ul>
          </section>

          {/* Sección: Información del Proyecto */}
          <section className="border-t border-border pt-4">
            <h3 className="mb-3 font-medium text-foreground">Información del Proyecto</h3>
            <div className="section-box-light text-sm">
              <p className="text-muted-foreground mb-2">
                <strong>Universidad:</strong> Laica Eloy Alfaro de Manabí (ULEAM)
              </p>
              <p className="text-muted-foreground mb-2">
                <strong>Materia:</strong> Investigación de Operaciones
              </p>
              <p className="text-muted-foreground mb-2">
                <strong>Docente:</strong> Ing. Carlos Eduardo Anchundia Betancourt
              </p>
              <p className="text-muted-foreground">
                <strong>Año:</strong> 2026
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
