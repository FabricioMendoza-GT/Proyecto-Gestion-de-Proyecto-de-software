'use client';

import { CheckCircle2, ChevronDown, CircleHelp, Play } from 'lucide-react';
import type { Paso } from '@/lib/algoritmos-transporte';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface PropsPanelPasos {
  pasos: Paso[];
  costos: number[][];
  origenesFicticios?: number[];
  destinosFicticios?: number[];
  pasoActual: number;
  alCambiarPaso: (paso: number) => void;
}

function estaAgotado(valor: number) {
  return Math.abs(valor) <= 1e-9;
}

function formatearNumero(valor: number) {
  return valor.toLocaleString('es-EC', { maximumFractionDigits: 2 });
}

function formatearPenalidad(penalidad: NonNullable<Paso['penalizacionesVogel']>['filas'][number]) {
  if (!penalidad) return '-';
  return `${formatearNumero(penalidad.minuendo)} - ${formatearNumero(penalidad.sustraendo)} = ${formatearNumero(penalidad.resultado)}`;
}

function etiquetaOrigen(indice: number, origenesFicticios: number[]) {
  return `O${indice + 1}${origenesFicticios.includes(indice) ? ' F' : ''}`;
}

function etiquetaDestino(indice: number, destinosFicticios: number[]) {
  return `D${indice + 1}${destinosFicticios.includes(indice) ? ' F' : ''}`;
}

function explicarPaso(paso: Paso, costos: number[][], origenesFicticios: number[], destinosFicticios: number[]) {
  const celda = paso.celdasResaltadas[0];
  if (!celda) {
    return 'En este paso se actualiza el estado de la matriz. Revisa las ofertas y demandas restantes para ver que filas o columnas ya quedaron cerradas.';
  }

  const asignacion = paso.asignaciones[celda.fila]?.[celda.columna] ?? 0;
  const costo = costos[celda.fila]?.[celda.columna] ?? 0;
  const origen = etiquetaOrigen(celda.fila, origenesFicticios);
  const destino = etiquetaDestino(celda.columna, destinosFicticios);
  const filaCerrada = estaAgotado(paso.ofertaRestante[celda.fila]);
  const columnaCerrada = estaAgotado(paso.demandaRestante[celda.columna]);
  const esFicticio = origenesFicticios.includes(celda.fila) || destinosFicticios.includes(celda.columna);
  const cierre = [
    filaCerrada ? `${origen} queda sin oferta restante` : null,
    columnaCerrada ? `${destino} queda sin demanda restante` : null,
  ].filter(Boolean).join(' y ');

  return [
    `Se asignan ${formatearNumero(asignacion)} unidades desde ${origen} hacia ${destino}.`,
    `El costo usado en esa casilla es ${formatearNumero(costo)}, por eso este paso suma ${formatearNumero(asignacion * costo)} al costo acumulado.`,
    cierre ? `Despues de asignar, ${cierre}. Las filas o columnas cerradas aparecen con fondo suave y tachado.` : 'Despues de asignar todavia queda oferta y demanda en esa fila o columna.',
    esFicticio ? 'La etiqueta F indica una fila o columna ficticia creada por el balanceo. Si recibe unidades con costo 0, solo representa sobrante o faltante para cuadrar el modelo.' : null,
  ].filter(Boolean).join(' ');
}

export function PanelPasos({
  pasos,
  costos,
  origenesFicticios = [],
  destinosFicticios = [],
  pasoActual,
  alCambiarPaso,
}: PropsPanelPasos) {
  if (pasos.length === 0) return null;

  const progreso = ((pasoActual + 1) / pasos.length) * 100;

  return (
    <div className="panel-action">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Play className="w-5 h-5 text-blue-500" />
            <h3 className="font-medium text-foreground">
              Desarrollo paso a paso
            </h3>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {pasos.length} iteracion{pasos.length === 1 ? '' : 'es'} generada{pasos.length === 1 ? '' : 's'} por el metodo seleccionado.
          </p>
        </div>

        <div className="min-w-[220px]">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Paso activo</span>
            <span>{pasoActual + 1} / {pasos.length}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
              style={{ width: `${progreso}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {pasos.map((paso, indicePaso) => {
          const abierto = indicePaso === pasoActual;
          const penalizaciones = paso.penalizacionesVogel;
          const origenesAgotados = paso.ofertaRestante
            .map((valor, idx) => (estaAgotado(valor) ? etiquetaOrigen(idx, origenesFicticios) : null))
            .filter(Boolean)
            .join(', ');
          const destinosAgotados = paso.demandaRestante
            .map((valor, idx) => (estaAgotado(valor) ? etiquetaDestino(idx, destinosFicticios) : null))
            .filter(Boolean)
            .join(', ');
          const explicacion = explicarPaso(paso, costos, origenesFicticios, destinosFicticios);

          return (
            <details
              key={paso.iteracion}
              open={abierto}
              className={`rounded-xl border bg-card shadow-sm transition-all ${abierto ? 'border-blue-300' : 'border-border'}`}
              onToggle={(evento) => {
                if (evento.currentTarget.open) alCambiarPaso(indicePaso);
              }}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4">
                <div className="flex min-w-0 items-start gap-3">
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${abierto ? 'bg-blue-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                    {indicePaso + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-medium text-foreground">Iteracion {indicePaso + 1}</h4>
                      {abierto && (
                        <span className="badge badge-blue">Visible en la tabla principal</span>
                      )}
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-700 transition-colors hover:bg-blue-100"
                            aria-label={`Explicar iteracion ${indicePaso + 1}`}
                            onClick={(evento) => evento.stopPropagation()}
                          >
                            <CircleHelp className="h-4 w-4" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 text-sm leading-relaxed" align="start">
                          {explicacion}
                        </PopoverContent>
                      </Popover>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{paso.descripcion}</p>
                  </div>
                </div>
                <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform details-open:rotate-180" />
              </summary>

              <div className="space-y-4 border-t border-border p-4 pt-5">
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                  <div className="section-box-light">
                    <span className="text-xs font-medium uppercase text-blue-700">Costo acumulado</span>
                    <div className="mt-2 text-2xl font-bold leading-none text-blue-700">
                      ${formatearNumero(paso.costo)}
                    </div>
                  </div>
                  <div className="section-box-light">
                    <span className="text-xs font-medium uppercase text-slate-600">Origenes tachados</span>
                    <div className="mt-2 text-sm text-slate-700">{origenesAgotados || 'Ninguno'}</div>
                  </div>
                  <div className="section-box-light">
                    <span className="text-xs font-medium uppercase text-slate-600">Destinos tachados</span>
                    <div className="mt-2 text-sm text-slate-700">{destinosAgotados || 'Ninguno'}</div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="table-base min-w-[720px]">
                    <thead>
                      <tr>
                        <th className="table-header">Origen / Destino</th>
                        {paso.demandaRestante.map((demandaRestante, columna) => {
                          const columnaAgotada = estaAgotado(demandaRestante);
                          return (
                            <th
                              key={columna}
                              className={`table-header text-center ${columnaAgotada ? 'bg-amber-100 text-amber-900' : ''}`}
                            >
                              <span className={columnaAgotada ? 'line-through decoration-2' : ''}>
                                {etiquetaDestino(columna, destinosFicticios)}
                              </span>
                              <span className={`ml-2 rounded-full px-2 py-0.5 text-[11px] font-semibold ${columnaAgotada ? 'bg-amber-200 text-amber-900 line-through decoration-2' : 'bg-green-100 text-green-700'}`}>
                                {formatearNumero(demandaRestante)}
                              </span>
                            </th>
                          );
                        })}
                        <th className="table-cell bg-blue-50 text-center font-medium text-blue-800">Oferta</th>
                        {penalizaciones && (
                          <th className="table-cell bg-indigo-50 text-center font-medium text-indigo-800">Penalidad fila</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {paso.asignaciones.map((filaAsignaciones, fila) => {
                        const filaAgotada = estaAgotado(paso.ofertaRestante[fila]);
                        return (
                          <tr key={fila}>
                            <th className={`table-cell text-center font-medium ${filaAgotada ? 'bg-amber-100 text-amber-900' : 'bg-muted text-slate-700'}`}>
                              <span className={filaAgotada ? 'line-through decoration-2' : ''}>
                                {etiquetaOrigen(fila, origenesFicticios)}
                              </span>
                              <span className={`ml-2 rounded-full px-2 py-0.5 text-[11px] font-semibold ${filaAgotada ? 'bg-amber-200 text-amber-900 line-through decoration-2' : 'bg-blue-100 text-blue-700'}`}>
                                {formatearNumero(paso.ofertaRestante[fila])}
                              </span>
                            </th>
                            {filaAsignaciones.map((asignacion, columna) => {
                              const seleccionada = paso.celdasResaltadas.some(
                                (celda) => celda.fila === fila && celda.columna === columna
                              );
                              const columnaAgotada = estaAgotado(paso.demandaRestante[columna]);
                              const celdaAgotada = filaAgotada || columnaAgotada;
                              return (
                                <td
                                  key={`${fila}-${columna}`}
                                  className={`table-cell text-center align-middle ${celdaAgotada ? 'bg-amber-50 text-amber-900' : seleccionada ? 'bg-blue-100 text-blue-900' : 'bg-white text-slate-700'}`}
                                >
                                  <div className="flex flex-col items-center gap-1">
                                    <span className={`text-base font-semibold ${celdaAgotada ? 'line-through decoration-2' : ''}`}>
                                      {formatearNumero(costos[fila]?.[columna] ?? 0)}
                                    </span>
                                    {asignacion > 0 ? (
                                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${celdaAgotada ? 'bg-amber-200 text-amber-900 line-through decoration-2' : 'bg-green-100 text-green-800'}`}>
                                        {seleccionada && <CheckCircle2 className="h-3 w-3" />}
                                        {formatearNumero(asignacion)}
                                      </span>
                                    ) : (
                                      <span className="text-slate-400">-</span>
                                    )}
                                  </div>
                                </td>
                              );
                            })}
                            <td className={`table-cell text-center font-semibold ${filaAgotada ? 'bg-amber-100 text-amber-900 line-through decoration-2' : 'bg-blue-50 text-blue-800'}`}>
                              {formatearNumero(paso.ofertaRestante[fila])}
                            </td>
                            {penalizaciones && (
                              <td className={`table-cell text-center font-semibold ${
                                penalizaciones.seleccionado.tipo === 'fila' && penalizaciones.seleccionado.indice === fila
                                  ? 'bg-indigo-200 text-indigo-950 ring-2 ring-inset ring-indigo-500'
                                  : filaAgotada
                                    ? 'bg-amber-100 text-amber-900'
                                    : 'bg-indigo-50 text-indigo-800'
                              }`}>
                                {formatearPenalidad(penalizaciones.filas[fila])}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                      {penalizaciones && (
                        <tr>
                          <td className="table-cell bg-indigo-100 font-medium text-indigo-800">Penalidad columna</td>
                          {penalizaciones.columnas.map((valor, columna) => (
                            <td
                              key={`penalidad-columna-${columna}`}
                              className={`table-cell text-center font-semibold ${
                                penalizaciones.seleccionado.tipo === 'columna' && penalizaciones.seleccionado.indice === columna
                                  ? 'bg-indigo-200 text-indigo-950 ring-2 ring-inset ring-indigo-500'
                                  : estaAgotado(paso.demandaRestante[columna])
                                    ? 'bg-amber-100 text-amber-900'
                                    : 'bg-indigo-50 text-indigo-800'
                              }`}
                            >
                              {formatearPenalidad(valor)}
                            </td>
                          ))}
                          <td className="table-cell bg-indigo-50" />
                          <td className="table-cell bg-indigo-50" />
                        </tr>
                      )}
                      <tr>
                        <td className="table-cell bg-green-100 font-medium text-green-800">Demanda</td>
                        {paso.demandaRestante.map((valor, columna) => (
                          <td
                            key={`demanda-${columna}`}
                            className={`table-cell text-center font-semibold ${estaAgotado(valor) ? 'bg-amber-100 text-amber-900 line-through decoration-2' : 'bg-green-50 text-green-800'}`}
                          >
                            {formatearNumero(valor)}
                          </td>
                        ))}
                        <td className="table-cell bg-muted" />
                        {penalizaciones && <td className="table-cell bg-muted" />}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
