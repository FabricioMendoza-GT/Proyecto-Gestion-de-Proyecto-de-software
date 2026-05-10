/**
 * =====================================================================
 * COMPONENTE: Panel de Pasos
 * 
 * Muestra la visualización paso a paso de la resolución del problema.
 * Incluye navegación entre pasos, descripción de cada iteración,
 * y visualización de ofertas/demandas restantes.
 * 
 * CÓMO MODIFICAR:
 * - Colores de la barra de progreso: busque bg-gradient-to-r
 * - Estilos de los badges de oferta/demanda: busque bg-blue-* y bg-green-*
 * =====================================================================
 */
'use client';

import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import type { Paso } from '@/lib/algoritmos-transporte';

/* =====================================================================
   TIPOS/INTERFACES
   ===================================================================== */
interface PropsPanelPasos {
  /** Lista de todos los pasos de la solución */
  pasos: Paso[];
  /** Índice del paso actualmente visible */
  pasoActual: number;
  /** Callback al cambiar de paso */
  alCambiarPaso: (paso: number) => void;
}

/* =====================================================================
   COMPONENTE PRINCIPAL
   ===================================================================== */
export function PanelPasos({ pasos, pasoActual, alCambiarPaso }: PropsPanelPasos) {
  // No renderizar si no hay pasos
  if (pasos.length === 0) return null;

  const paso = pasos[pasoActual];
  const progreso = ((pasoActual + 1) / pasos.length) * 100;

  return (
    <div className="bg-card rounded-lg border border-border shadow-md p-6 space-y-4">
      {/* ===== ENCABEZADO CON NAVEGACIÓN ===== */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-foreground mb-1">
            Iteración {pasoActual + 1} / {pasos.length}
          </h3>
          {/* Barra de progreso */}
          <div className="w-48 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
              style={{ width: `${progreso}%` }}
            />
          </div>
        </div>
        
        {/* Botones de navegación */}
        <div className="flex gap-2">
          <button
            onClick={() => alCambiarPaso(Math.max(0, pasoActual - 1))}
            disabled={pasoActual === 0}
            className="p-2 rounded-lg border-2 border-border hover:bg-blue-50 hover:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            aria-label="Paso anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => alCambiarPaso(Math.min(pasos.length - 1, pasoActual + 1))}
            disabled={pasoActual === pasos.length - 1}
            className="p-2 rounded-lg border-2 border-border hover:bg-blue-50 hover:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            aria-label="Paso siguiente"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ===== DESCRIPCIÓN DEL PASO ACTUAL ===== */}
      <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border-2 border-yellow-200 shadow-sm">
        <div className="flex items-start gap-2">
          <div className="flex items-center justify-center w-6 h-6 bg-yellow-400 rounded-full flex-shrink-0 mt-0.5">
            <Play className="w-3 h-3 text-white" />
          </div>
          <p className="text-sm flex-1 text-foreground">{paso.descripcion}</p>
        </div>
      </div>

      {/* ===== OFERTAS Y DEMANDAS RESTANTES ===== */}
      <div className="grid grid-cols-2 gap-4">
        {/* Ofertas restantes */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2 text-blue-800">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            Oferta Restante
          </h4>
          <div className="flex flex-wrap gap-2">
            {paso.ofertaRestante.map((valor, idx) => (
              <div
                key={idx}
                className={`px-3 py-1.5 rounded-md text-sm ${
                  valor === 0 
                    ? 'bg-muted text-muted-foreground line-through' 
                    : 'bg-blue-200 text-blue-700'
                }`}
              >
                O{idx + 1}: {valor}
              </div>
            ))}
          </div>
        </div>
        
        {/* Demandas restantes */}
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2 text-green-800">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            Demanda Restante
          </h4>
          <div className="flex flex-wrap gap-2">
            {paso.demandaRestante.map((valor, idx) => (
              <div
                key={idx}
                className={`px-3 py-1.5 rounded-md text-sm ${
                  valor === 0 
                    ? 'bg-muted text-muted-foreground line-through' 
                    : 'bg-green-200 text-green-700'
                }`}
              >
                D{idx + 1}: {valor}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== COSTO ACUMULADO ===== */}
      <div className="pt-4 border-t border-border">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <span className="text-sm opacity-90">Costo Acumulado</span>
            <span className="text-3xl font-bold">${paso.costo.toLocaleString('es-EC')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
