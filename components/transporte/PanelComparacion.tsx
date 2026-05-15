/**
 * =====================================================================
 * COMPONENTE: Panel de Comparación
 * 
 * Muestra la comparación de resultados entre los tres métodos de transporte.
 * Resalta el método con el mejor costo y muestra las diferencias.
 * 
 * CÓMO MODIFICAR:
 * - Colores del ganador: busque border-green-* y bg-green-*
 * - Icono del trofeo: modifique el componente Trophy
 * =====================================================================
 */
'use client';

import { Trophy, TrendingUp, Activity } from 'lucide-react';

/* =====================================================================
   TIPOS/INTERFACES
   ===================================================================== */
interface ResultadoMetodo {
  /** Nombre del método */
  metodo: string;
  /** Costo total obtenido */
  costo: number;
  /** Matriz de asignaciones */
  asignaciones: number[][];
}

interface PropsPanelComparacion {
  /** Lista de resultados de cada método */
  resultados: ResultadoMetodo[];
}

/* =====================================================================
   COMPONENTE PRINCIPAL
   ===================================================================== */
export function PanelComparacion({ resultados }: PropsPanelComparacion) {
  // No renderizar si no hay resultados
  if (resultados.length === 0) return null;

  // Ordenar por costo (menor primero)
  const resultadosOrdenados = [...resultados].sort((a, b) => a.costo - b.costo);
  const mejorCosto = resultadosOrdenados[0]?.costo;

  return (
    <div className="panel-action">
      {/* ===== ENCABEZADO ===== */}
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-500" />
          <h3 className="font-medium text-foreground">Comparación de Métodos</h3>
        </div>
      </div>

      {/* ===== LISTA DE RESULTADOS ===== */}
      <div className="space-y-3">
        {resultadosOrdenados.map((resultado, idx) => (
          <div
            key={resultado.metodo}
            className={`result-card ${resultado.costo === mejorCosto ? 'result-card-winning' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Indicador de posición o trofeo para el ganador */}
                {resultado.costo === mejorCosto ? (
                  <div className="flex items-center justify-center w-10 h-10 bg-green-500 rounded-full shadow-md">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-full text-muted-foreground font-medium">
                    #{idx + 1}
                  </div>
                )}
                
                <div>
                  <div className={`font-medium ${
                    resultado.costo === mejorCosto ? 'text-green-700' : 'text-foreground'
                  }`}>
                    {resultado.metodo}
                  </div>
                  {/* Etiqueta de mejor método */}
                  {resultado.costo === mejorCosto && (
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-600">Mejor entre métodos comparados</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Costo y diferencia */}
              <div className="text-right">
                <div className={`text-2xl font-bold ${
                  resultado.costo === mejorCosto ? 'text-green-600' : 'text-blue-600'
                }`}>
                  ${resultado.costo.toLocaleString('es-EC')}
                </div>
                {/* Mostrar diferencia con el mejor */}
                {resultado.costo !== mejorCosto && (
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-orange-500" />
                    <span className="text-xs text-orange-600">
                      +${(resultado.costo - mejorCosto).toLocaleString('es-EC')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ===== RESUMEN ===== */}
      <div className="pt-4 border-t border-border">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <span className="text-xs text-green-600 uppercase font-medium">Mejor costo</span>
            <div className="text-2xl font-bold text-green-700 mt-1">
              ${mejorCosto.toLocaleString('es-EC')}
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <span className="text-xs text-orange-600 uppercase font-medium">Diferencia máxima</span>
            <div className="text-2xl font-bold text-orange-700 mt-1">
              ${(resultadosOrdenados[resultadosOrdenados.length - 1]?.costo - mejorCosto).toLocaleString('es-EC')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
