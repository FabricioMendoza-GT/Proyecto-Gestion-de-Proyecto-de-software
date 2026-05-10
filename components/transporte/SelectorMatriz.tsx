/**
 * =====================================================================
 * COMPONENTE: Selector de Matriz
 * 
 * Permite seleccionar rápidamente un tamaño de matriz predefinido.
 * Los tamaños disponibles van de 2x2 hasta 5x5.
 * 
 * CÓMO MODIFICAR:
 * - Para agregar más tamaños: modifique el array TAMANOS
 * - Para cambiar el estilo de los botones: busque las clases px-*, py-*
 * =====================================================================
 */
'use client';

import { Grid3x3 } from 'lucide-react';

/* =====================================================================
   CONFIGURACIÓN DE TAMAÑOS PREDEFINIDOS
   Modifique este array para cambiar las opciones disponibles
   ===================================================================== */
const TAMANOS = [
  { etiqueta: '2×2', filas: 2, columnas: 2 },
  { etiqueta: '3×3', filas: 3, columnas: 3 },
  { etiqueta: '3×4', filas: 3, columnas: 4 },
  { etiqueta: '4×4', filas: 4, columnas: 4 },
  { etiqueta: '4×5', filas: 4, columnas: 5 },
  { etiqueta: '5×5', filas: 5, columnas: 5 },
];

/* =====================================================================
   TIPOS/INTERFACES
   ===================================================================== */
interface PropsSelectorMatriz {
  /** Callback al seleccionar un tamaño */
  alSeleccionar: (filas: number, columnas: number) => void;
}

/* =====================================================================
   COMPONENTE PRINCIPAL
   ===================================================================== */
export function SelectorMatriz({ alSeleccionar }: PropsSelectorMatriz) {
  return (
    <div className="space-y-3">
      {/* Etiqueta */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Grid3x3 className="w-4 h-4" />
        <span>Tamaño de matriz</span>
      </div>
      
      {/* Botones de tamaño */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {TAMANOS.map((tamano) => (
          <button
            key={tamano.etiqueta}
            onClick={() => alSeleccionar(tamano.filas, tamano.columnas)}
            className="px-4 py-2 bg-card border-2 border-border rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-sm font-medium"
          >
            {tamano.etiqueta}
          </button>
        ))}
      </div>
    </div>
  );
}
