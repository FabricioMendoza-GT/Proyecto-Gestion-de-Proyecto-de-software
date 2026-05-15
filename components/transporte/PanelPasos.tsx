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
  /** Matriz de costos original */
  costos: number[][];
  /** Índice del paso actualmente visible */
  pasoActual: number;
  /** Callback al cambiar de paso */
  alCambiarPaso: (paso: number) => void;
}

/* =====================================================================
   COMPONENTE PRINCIPAL
   ===================================================================== */
export function PanelPasos({ pasos, costos, pasoActual, alCambiarPaso }: PropsPanelPasos) {
  // No renderizar si no hay pasos
  if (pasos.length === 0) return null;

  const paso = pasos[pasoActual];
  const progreso = ((pasoActual + 1) / pasos.length) * 100;

  const filasVisibles = paso.ofertaRestante.map((_, idx) => idx);
  const columnasVisibles = paso.demandaRestante.map((_, idx) => idx);

  const filaInactiva = (idx: number) => paso.ofertaRestante[idx] <= 0;
  const columnaInactiva = (idx: number) => paso.demandaRestante[idx] <= 0;

  return (
    <div className="panel-action">
      {/* ===== ENCABEZADO CON NAVEGACIÓN ===== */}
        <div className="flex items-start justify-between gap-4">
        <div>
            <h3 className="font-medium text-foreground mb-2">
            Iteración {pasoActual + 1} / {pasos.length}
          </h3>
          {/* Barra de progreso */}
            <div className="w-56 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
              style={{ width: `${progreso}%` }}
            />
          </div>
        </div>
        
        {/* Botones de navegación */}
          <div className="flex gap-3">
          <button
            onClick={() => alCambiarPaso(Math.max(0, pasoActual - 1))}
            disabled={pasoActual === 0}
            className="icon-btn"
            aria-label="Paso anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => alCambiarPaso(Math.min(pasos.length - 1, pasoActual + 1))}
            disabled={pasoActual === pasos.length - 1}
            className="icon-btn"
            aria-label="Paso siguiente"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ===== DESCRIPCIÓN DEL PASO ACTUAL ===== */}
      <div className="section-box-light">
        <div className="flex items-start gap-2">
          <div className="flex items-center justify-center w-6 h-6 bg-yellow-400 rounded-full flex-shrink-0 mt-0.5">
            <Play className="w-3 h-3 text-white" />
          </div>
            <p className="text-sm leading-relaxed flex-1 text-foreground">{paso.descripcion}</p>
        </div>
      </div>

      {/* ===== OFERTAS Y DEMANDAS RESTANTES ===== */}
      <div className="grid grid-cols-2 gap-4">
        {/* Ofertas restantes */}
        <div className="section-box-light">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2 text-blue-800">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            Oferta Restante
          </h4>
            <div className="flex flex-wrap gap-3">
            {paso.ofertaRestante.map((valor, idx) => (
              <div
                key={idx}
                  className={`px-3.5 py-2 rounded-lg text-sm ${
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
        <div className="section-box-light">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2 text-green-800">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            Demanda Restante
          </h4>
            <div className="flex flex-wrap gap-3">
            {paso.demandaRestante.map((valor, idx) => (
              <div
                key={idx}
                  className={`px-3.5 py-2 rounded-lg text-sm ${
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

      {/* ===== MATRIZ DINÁMICA ===== */}
      <div className="section-box-light">
        <div className="flex flex-col gap-2 mb-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 className="text-sm font-medium text-foreground">Matriz de asignaciones</h4>
            <p className="text-xs text-muted-foreground">Se muestra la matriz completa con orígenes/destinos inactivos atenuados. Esto mantiene la estructura familiar y mejora la comprensión.</p>
          </div>
          <div className="text-xs text-slate-500">
            <span>Las filas/columnas completadas se atenúan</span>
          </div>
        </div>

        <div className="panel-summary">
          <div>Orígenes completados: {paso.ofertaRestante.map((valor, idx) => valor <= 0 ? `O${idx + 1}` : null).filter(Boolean).join(', ') || 'ninguno'}</div>
          <div>Destinos completados: {paso.demandaRestante.map((valor, idx) => valor <= 0 ? `D${idx + 1}` : null).filter(Boolean).join(', ') || 'ninguno'}</div>
        </div>

        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th className="table-header">Origen / Destino</th>
                {columnasVisibles.map((columna) => (
                  <th
                    key={columna}
                    className={`p-3 border border-border text-left text-xs uppercase tracking-wide ${
                      columnaInactiva(columna) ? 'bg-muted/40 text-muted-foreground' : 'bg-muted text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>D{columna + 1}</span>
                      <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                        {paso.demandaRestante[columna]}
                      </span>
                    </div>
                  </th>
                ))}
                <th className="table-cell font-medium bg-blue-50 text-blue-800">Oferta</th>
              </tr>
            </thead>
            <tbody>
              {filasVisibles.map((fila) => {
                const filaInactiva = paso.ofertaRestante[fila] <= 0;
                return (
                  <tr key={fila} className={filaInactiva ? 'opacity-70' : ''}>
                    <th
                      className={`p-3 border border-border ${
                        filaInactiva ? 'bg-muted/40 text-muted-foreground' : 'bg-muted text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">O{fila + 1}</span>
                        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] text-slate-700">
                          {paso.ofertaRestante[fila]}
                        </span>
                      </div>
                    </th>
                    {columnasVisibles.map((columna) => {
                      const valorAsignacion = paso.asignaciones[fila]?.[columna] ?? 0;
                      const costo = costos[fila]?.[columna] ?? 0;
                      const estaSeleccionada = paso.celdasResaltadas.some(
                        (celda) => celda.fila === fila && celda.columna === columna
                      );
                      return (
                        <td
                          key={`${fila}-${columna}`}
                          className={`p-3 border border-border align-middle text-center ${
                            estaSeleccionada ? 'bg-blue-100 text-blue-900 font-semibold' : 'bg-white text-slate-700'
                          } ${
                            columnaInactiva(columna) ? 'bg-muted/20 text-muted-foreground' : ''
                          }`}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xs text-slate-500">${costo}</span>
                            {valorAsignacion > 0 ? (
                              <span className="inline-flex items-center justify-center rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                                {valorAsignacion}
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                    <td className="p-3 border border-border bg-blue-50 text-center text-slate-700">{paso.ofertaRestante[fila]}</td>
                  </tr>
                );
              })}
              {/* Fila de demandas restantes */}
              <tr>
                <td className="p-3 border border-border bg-green-100 text-sm font-medium text-green-800">
                  Demanda
                </td>
                {columnasVisibles.map((columna) => (
                  <td
                    key={`demanda-${columna}`}
                    className={`p-3 border border-border text-center ${
                      columnaInactiva(columna) ? 'bg-muted/20 text-muted-foreground' : 'bg-green-50 text-slate-700'
                    }`}
                  >
                    <span className="font-semibold text-sm">{paso.demandaRestante[columna]}</span>
                  </td>
                ))}
                <td className="p-3 border border-border bg-muted"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== COSTO ACUMULADO ===== */}
      <div className="pt-4 border-t border-border">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <span className="text-sm opacity-90">Costo Acumulado</span>
              <span className="text-3xl font-bold leading-none">${paso.costo.toLocaleString('es-EC')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
