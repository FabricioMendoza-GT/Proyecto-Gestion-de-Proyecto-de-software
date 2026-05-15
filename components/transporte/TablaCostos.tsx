/**
 * =====================================================================
 * COMPONENTE: Tabla de Transporte
 * 
 * Muestra la matriz de costos, ofertas y demandas.
 * Permite editar valores, agregar/eliminar filas y columnas.
 * 
 * CÓMO MODIFICAR:
 * - Colores de celdas: busque las clases bg-* y text-*
 * - Tamaño de inputs: modifique las clases p-*, w-*, h-*
 * - Estilos del indicador de balance: vea el div con "Balance"
 * =====================================================================
 */
'use client';

import { Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react';

/* =====================================================================
   TIPOS/INTERFACES
   ===================================================================== */
interface PropsTablaCostos {
  /** Matriz de costos unitarios */
  costos: number[][];
  /** Vector de ofertas por origen */
  oferta: number[];
  /** Vector de demandas por destino */
  demanda: number[];
  /** Callback al cambiar un costo */
  alCambiarCosto: (fila: number, columna: number, valor: string) => void;
  /** Callback al cambiar una oferta */
  alCambiarOferta: (indice: number, valor: string) => void;
  /** Callback al cambiar una demanda */
  alCambiarDemanda: (indice: number, valor: string) => void;
  /** Callback para agregar una fila */
  alAgregarFila: () => void;
  /** Callback para agregar una columna */
  alAgregarColumna: () => void;
  /** Callback para eliminar una fila */
  alEliminarFila: (indice: number) => void;
  /** Callback para eliminar una columna */
  alEliminarColumna: (indice: number) => void;
  /** Callback para limpiar todos los datos */
  alLimpiarDatos: () => void;
  /** Indica si se puede agregar otra fila */
  puedeAgregarFila?: boolean;
  /** Indica si se puede agregar otra columna */
  puedeAgregarColumna?: boolean;
  /** Límite máximo de filas */
  limiteFilas?: number;
  /** Límite máximo de columnas */
  limiteColumnas?: number;
  /** Celdas a resaltar durante la visualización paso a paso */
  celdasResaltadas?: { fila: number; columna: number }[];
  /** Matriz de asignaciones actuales para mostrar */
  asignaciones?: number[][];
}

/* =====================================================================
   COMPONENTE PRINCIPAL
   ===================================================================== */
export function TablaCostos({
  costos,
  oferta,
  demanda,
  alCambiarCosto,
  alCambiarOferta,
  alCambiarDemanda,
  alAgregarFila,
  alAgregarColumna,
  alEliminarFila,
  alEliminarColumna,
  alLimpiarDatos,
  puedeAgregarFila = true,
  puedeAgregarColumna = true,
  limiteFilas,
  limiteColumnas,
  celdasResaltadas = [],
  asignaciones = [],
}: PropsTablaCostos) {
  /* ===== CÁLCULO DEL BALANCE ===== */
  const totalOferta = oferta.reduce((a, b) => a + b, 0);
  const totalDemanda = demanda.reduce((a, b) => a + b, 0);
  const toleranciaBalance = 1e-9;
  const estaBalanceado = Math.abs(totalOferta - totalDemanda) <= toleranciaBalance;

  /**
   * Verifica si una celda específica debe estar resaltada
   */
  const celdaEstaResaltada = (fila: number, columna: number) => {
    return celdasResaltadas.some(celda => celda.fila === fila && celda.columna === columna);
  };

  return (
    <div className="space-y-4">
      {/* ===== INDICADOR DE BALANCE ===== 
          Muestra si el problema está balanceado (oferta = demanda) */}
      <div className={`px-4 py-3 rounded-lg shadow-sm ${
        estaBalanceado 
          ? 'bg-green-50 border-2 border-green-300' 
          : 'bg-amber-50 border-2 border-amber-300'
      }`}>
        <div className="flex items-center gap-3">
          {estaBalanceado ? (
            <div className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-full">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
          ) : (
            <AlertCircle className="w-8 h-8 text-amber-500" />
          )}
          <div className="flex-1">
            <div className={`font-medium ${estaBalanceado ? 'text-green-700' : 'text-amber-700'}`}>
              {estaBalanceado ? 'Problema Balanceado' : 'Problema NO Balanceado'}
            </div>
            <div className="text-sm text-muted-foreground">
              {estaBalanceado ? (
                <>Oferta total = Demanda total = <strong>{totalOferta}</strong></>
              ) : (
                <>
                  Oferta: <strong>{totalOferta}</strong> | 
                  Demanda: <strong>{totalDemanda}</strong> | 
                  Diferencia: <strong className="text-amber-600">{Math.abs(totalOferta - totalDemanda)}</strong>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== TABLA PRINCIPAL DE COSTOS =====
          Estructura: Costos + Oferta en filas, Demanda en última fila */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="table-base">
          {/* Encabezado con destinos */}
          <thead>
            <tr>
              <th className="table-header"></th>
              {demanda.map((_, idx) => (
                <th key={idx} className="table-header min-w-[100px]">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-sm font-medium">D{idx + 1}</span>
                    {/* Botón eliminar columna (solo si hay más de 1) */}
                    {demanda.length > 1 && (
                      <button
                        onClick={() => alEliminarColumna(idx)}
                        className="p-1 hover:bg-destructive/10 rounded transition-colors"
                        title={`Eliminar destino ${idx + 1}`}
                      >
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </button>
                    )}
                  </div>
                </th>
              ))}
              <th className="table-cell font-medium bg-blue-100 text-blue-800">
                Oferta
              </th>
            </tr>
          </thead>
          
          {/* Cuerpo: filas de orígenes con costos */}
          <tbody>
            {costos.map((fila, indiceFila) => (
              <tr key={indiceFila}>
                {/* Etiqueta del origen */}
                <td className="table-cell bg-muted">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-sm font-medium">O{indiceFila + 1}</span>
                    {/* Botón eliminar fila (solo si hay más de 1) */}
                    {costos.length > 1 && (
                      <button
                        onClick={() => alEliminarFila(indiceFila)}
                        className="p-1 hover:bg-destructive/10 rounded transition-colors"
                        title={`Eliminar origen ${indiceFila + 1}`}
                      >
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </button>
                    )}
                  </div>
                </td>
                
                {/* Celdas de costo */}
                {fila.map((costo, indiceColumna) => (
                  <td
                    key={indiceColumna}
                    className={`p-0 border border-border relative ${
                      celdaEstaResaltada(indiceFila, indiceColumna) 
                        ? 'bg-blue-100' 
                        : 'bg-card'
                    }`}
                  >
                    {/* Input para el costo */}
                    <input
                      type="number"
                      step="any"
                      value={costo}
                      onChange={(e) => alCambiarCosto(indiceFila, indiceColumna, e.target.value)}
                      className={`w-full h-full p-2 text-center border-0 outline-none focus:ring-2 focus:ring-primary/50 ${
                        celdaEstaResaltada(indiceFila, indiceColumna) 
                          ? 'bg-blue-100' 
                          : 'bg-card'
                      }`}
                      min="0"
                      aria-label={`Costo de O${indiceFila + 1} a D${indiceColumna + 1}`}
                    />
                    {/* Badge de asignación si existe */}
                    {asignaciones[indiceFila]?.[indiceColumna] > 0 && (
                      <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                        {asignaciones[indiceFila][indiceColumna]}
                      </div>
                    )}
                  </td>
                ))}
                
                {/* Celda de oferta */}
                <td className="table-cell bg-blue-50 p-0">
                  <input
                    type="number"
                    step="any"
                    value={oferta[indiceFila]}
                    onChange={(e) => alCambiarOferta(indiceFila, e.target.value)}
                    className="w-full h-full p-2 text-center bg-blue-50 border-0 outline-none focus:ring-2 focus:ring-primary/50"
                    min="0"
                    aria-label={`Oferta del origen ${indiceFila + 1}`}
                  />
                </td>
              </tr>
            ))}
            
            {/* Fila de demandas */}
            <tr>
              <td className="table-cell font-medium bg-green-100 text-green-800">
                Demanda
              </td>
              {demanda.map((d, idx) => (
                <td key={idx} className="p-0 border border-border bg-green-50">
                  <input
                    type="number"
                    step="any"
                    value={d}
                    onChange={(e) => alCambiarDemanda(idx, e.target.value)}
                    className="w-full h-full p-2 text-center bg-green-50 border-0 outline-none focus:ring-2 focus:ring-primary/50"
                    min="0"
                    aria-label={`Demanda del destino ${idx + 1}`}
                  />
                </td>
              ))}
              <td className="p-2 bg-muted border border-border"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ===== BOTONES DE ACCIÓN ===== */}
      <div className="flex flex-wrap gap-2">
        {/* Agregar origen */}
        <button
          onClick={alAgregarFila}
          disabled={!puedeAgregarFila}
          className="btn btn-primary disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Añadir Origen
        </button>
        
        {/* Agregar destino */}
        <button
          onClick={alAgregarColumna}
          disabled={!puedeAgregarColumna}
          className="btn btn-success disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Añadir Destino
        </button>
        
        {/* Limpiar datos */}
        <button
          onClick={alLimpiarDatos}
          className="btn btn-secondary"
        >
          <Trash2 className="w-4 h-4" />
          Limpiar datos
        </button>
      </div>

      {/* ===== INFORMACIÓN DE LÍMITES ===== */}
      <p className="text-xs text-muted-foreground">
        Límite actual: {limiteFilas ?? '-'} orígenes × {limiteColumnas ?? '-'} destinos según el método seleccionado.
      </p>
    </div>
  );
}
