/**
 * =====================================================================
 * COMPONENTE: Selector de Método
 * 
 * Permite seleccionar el método de resolución y el modo de visualización.
 * Métodos: Esquina Noroeste, Costo Mínimo, Aproximación de Vogel
 * Modos: Paso a Paso, Comparación de todos los métodos
 * 
 * CÓMO MODIFICAR:
 * - Para cambiar textos/descripciones: modifique el array METODOS
 * - Para cambiar estilos de selección: busque las clases border-*
 * =====================================================================
 */
'use client';

import { CheckCircle2 } from 'lucide-react';

/* =====================================================================
   TIPOS EXPORTADOS
   ===================================================================== */

/** Identificadores de los métodos de transporte disponibles */
export type MetodoTransporte = 'noroeste' | 'costo-minimo' | 'vogel';

/** Modos de visualización de la solución */
export type ModoSolucion = 'paso-a-paso' | 'comparacion';

/* =====================================================================
   CONFIGURACIÓN DE MÉTODOS
   Modifique este array para cambiar textos o agregar métodos
   ===================================================================== */
const METODOS: { id: MetodoTransporte; nombre: string; descripcion: string }[] = [
  {
    id: 'noroeste',
    nombre: 'Esquina Noroeste',
    descripcion: 'Comienza desde la celda superior izquierda',
  },
  {
    id: 'costo-minimo',
    nombre: 'Costo Mínimo',
    descripcion: 'Selecciona siempre el costo más bajo disponible',
  },
  {
    id: 'vogel',
    nombre: 'Aproximación de Vogel',
    descripcion: 'Calcula penalizaciones para optimizar la solución',
  },
];

/* =====================================================================
   TIPOS/INTERFACES
   ===================================================================== */
interface PropsSelectorMetodo {
  /** Método actualmente seleccionado */
  metodoSeleccionado: MetodoTransporte;
  /** Modo de solución actual */
  modoSeleccionado: ModoSolucion;
  /** Callback al cambiar el método */
  alCambiarMetodo: (metodo: MetodoTransporte) => void;
  /** Callback al cambiar el modo */
  alCambiarModo: (modo: ModoSolucion) => void;
}

/* =====================================================================
   COMPONENTE PRINCIPAL
   ===================================================================== */
export function SelectorMetodo({
  metodoSeleccionado,
  modoSeleccionado,
  alCambiarMetodo,
  alCambiarModo,
}: PropsSelectorMetodo) {
  return (
    <div className="h-full flex flex-col justify-between gap-6">
      {/* ===== SELECCIÓN DE MÉTODO ===== */}
      <div className="flex-1">
        <h3 className="text-sm font-medium mb-3 text-foreground">Seleccionar Método</h3>
        <div className="flex flex-col gap-3">
          {METODOS.map((metodo) => (
            <button
              key={metodo.id}
              onClick={() => alCambiarMetodo(metodo.id)}
              aria-pressed={metodoSeleccionado === metodo.id}
              className={`w-full p-3 rounded-lg border-2 transition-all text-left relative flex items-start gap-3 min-h-[60px] ${
                metodoSeleccionado === metodo.id
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-border bg-card hover:border-blue-300 hover:shadow-sm'
              }`}
            >
              {/* Indicador de selección */}
              {metodoSeleccionado === metodo.id && (
                <CheckCircle2 className="w-5 h-5 text-blue-500 absolute top-2 right-2" />
              )}
              <div className="flex-1">
                <div className="mb-0.5 text-sm font-medium leading-tight text-foreground">
                  {metodo.nombre}
                </div>
                <p className="text-xs text-muted-foreground leading-snug whitespace-normal">
                  {metodo.descripcion}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ===== SELECCIÓN DE MODO ===== */}
      <div>
        <h3 className="text-sm font-medium mb-3 text-foreground">Modo de Solución</h3>
        <div className="grid grid-cols-1 gap-3">
          {/* Modo Paso a Paso */}
          <button
            onClick={() => alCambiarModo('paso-a-paso')}
            aria-pressed={modoSeleccionado === 'paso-a-paso'}
            className={`w-full p-3 rounded-lg border-2 transition-all text-left relative flex items-start gap-3 min-h-[56px] ${
              modoSeleccionado === 'paso-a-paso'
                ? 'border-green-500 bg-green-50 shadow-md'
                : 'border-border bg-card hover:border-green-300 hover:shadow-sm'
            }`}
          >
            {modoSeleccionado === 'paso-a-paso' && (
              <CheckCircle2 className="w-5 h-5 text-green-500 absolute top-3 right-3" />
            )}
            <div className="flex-1">
              <div className="mb-1 font-medium text-foreground">Paso a Paso</div>
              <p className="text-xs text-muted-foreground">Ver cada iteración con explicaciones</p>
            </div>
          </button>
          
          {/* Modo Comparación */}
          <button
            onClick={() => alCambiarModo('comparacion')}
            aria-pressed={modoSeleccionado === 'comparacion'}
            className={`w-full p-3 rounded-lg border-2 transition-all text-left relative flex items-start gap-3 min-h-[56px] ${
              modoSeleccionado === 'comparacion'
                ? 'border-green-500 bg-green-50 shadow-md'
                : 'border-border bg-card hover:border-green-300 hover:shadow-sm'
            }`}
          >
            {modoSeleccionado === 'comparacion' && (
              <CheckCircle2 className="w-5 h-5 text-green-500 absolute top-3 right-3" />
            )}
            <div className="flex-1">
              <div className="mb-1 font-medium text-foreground">Comparación</div>
              <p className="text-xs text-muted-foreground">Comparar todos los métodos</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
