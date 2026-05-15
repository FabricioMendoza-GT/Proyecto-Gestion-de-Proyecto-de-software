/**
 * =====================================================================
 * COMPONENTE: Panel de Historial
 * 
 * Muestra el historial de problemas resueltos.
 * Permite cargar, eliminar y buscar ejercicios anteriores.
 * 
 * CÓMO MODIFICAR:
 * - Límite de historial: busque .slice(0, 20) en el componente padre
 * - Formato de fecha: modifique la función formatearFecha
 * =====================================================================
 */
'use client';

import { History, Search, Trash2, Calendar, Cpu } from 'lucide-react';
import { useState } from 'react';

/* =====================================================================
   TIPOS EXPORTADOS
   ===================================================================== */

/** Entrada individual del historial */
export interface EntradaHistorial {
  /** ID único de la entrada */
  id: string;
  /** Fecha de resolución */
  fecha: Date;
  /** Nombre del método utilizado */
  metodo: string;
  /** Modo de resolución (paso a paso o comparación) */
  modo: string;
  /** Costo total obtenido */
  costoTotal: number;
  /** Dimensiones de la matriz (ej: "3×4") */
  dimensiones: string;
  /** Matriz de costos guardada */
  costos: number[][];
  /** Vector de ofertas guardado */
  oferta: number[];
  /** Vector de demandas guardado */
  demanda: number[];
  /** Matriz de asignaciones guardada */
  asignaciones: number[][];
}

/* =====================================================================
   TIPOS/INTERFACES
   ===================================================================== */
interface PropsPanelHistorial {
  /** Lista de entradas del historial */
  historial: EntradaHistorial[];
  /** Callback para cargar una entrada */
  alCargar: (entrada: EntradaHistorial) => void;
  /** Callback para eliminar una entrada */
  alEliminar: (id: string) => void;
  /** Callback para limpiar todo el historial */
  alLimpiar: () => void;
}

/* =====================================================================
   COMPONENTE PRINCIPAL
   ===================================================================== */
export function PanelHistorial({ historial, alCargar, alEliminar, alLimpiar }: PropsPanelHistorial) {
  const [terminoBusqueda, setTerminoBusqueda] = useState('');

  // Filtrar historial por término de búsqueda
  const historialFiltrado = historial.filter(entrada =>
    entrada.metodo.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
    entrada.dimensiones.includes(terminoBusqueda)
  );

  /**
   * Formatea una fecha para mostrar en español
   */
  const formatearFecha = (fecha: Date) => {
    return new Date(fecha).toLocaleDateString('es-EC', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="panel-action">
      {/* ===== ENCABEZADO ===== */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <History className="w-5 h-5 text-blue-500" />
          <h3 className="font-medium text-foreground">Historial</h3>
          <span className="text-xs bg-blue-100 text-blue-600 px-2.5 py-1.5 rounded-full">
            {historial.length}
          </span>
        </div>
        {historial.length > 0 && (
          <button
            onClick={alLimpiar}
            className="btn btn-danger text-xs px-4 py-2"
          >
            Limpiar todo
          </button>
        )}
      </div>

      {/* ===== BÚSQUEDA ===== */}
      <div className="relative">
        <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={terminoBusqueda}
          onChange={(e) => setTerminoBusqueda(e.target.value)}
          placeholder="     Buscar por método o tamaño..."
          className="input-base pl-10"
        />
      </div>

      {/* ===== LISTA DE HISTORIAL ===== */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-personalizado">
        {historialFiltrado.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">
            {historial.length === 0 ? 'No hay problemas resueltos aún' : 'No se encontraron resultados'}
          </div>
        ) : (
          historialFiltrado.map((entrada) => (
            <div
              key={entrada.id}
              className="panel-item group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {/* Nombre del método */}
                  <div className="flex items-center gap-2 mb-2">
                    <Cpu className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span className="text-sm font-medium truncate text-foreground">{entrada.metodo}</span>
                  </div>
                  {/* Fecha y dimensiones */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      {formatearFecha(entrada.fecha)}
                    </div>
                    <span className="bg-muted px-2.5 py-1 rounded-full">
                      {entrada.dimensiones}
                    </span>
                  </div>
                  {/* Costo total */}
                  <div className="mt-3 text-lg font-bold text-blue-600">
                    ${entrada.costoTotal.toLocaleString('es-EC')}
                  </div>
                </div>
                
                {/* Botones de acción */}
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => alCargar(entrada)}
                    className="btn btn-primary text-xs px-4 py-2"
                  >
                    Cargar
                  </button>
                  <button
                    onClick={() => alEliminar(entrada.id)}
                    className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
