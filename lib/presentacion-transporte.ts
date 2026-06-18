import type { Paso, PenalizacionesVogel } from '@/lib/algoritmos-transporte';

/** Utilidades compartidas por la pagina y el PDF para describir una iteracion. */
export function estaAgotado(valor: number): boolean {
  return Math.abs(valor) <= 1e-9;
}

export function formatearNumeroTransporte(valor: number): string {
  return valor.toLocaleString('es-EC', { maximumFractionDigits: 2 });
}

export function formatearPenalidadVogel(
  penalidad: PenalizacionesVogel['filas'][number]
): string {
  if (!penalidad) return '-';
  return `${formatearNumeroTransporte(penalidad.minuendo)} - ${formatearNumeroTransporte(penalidad.sustraendo)} = ${formatearNumeroTransporte(penalidad.resultado)}`;
}

export function etiquetaOrigen(indice: number, origenesFicticios: number[] = []): string {
  return `O${indice + 1}${origenesFicticios.includes(indice) ? ' F' : ''}`;
}

export function etiquetaDestino(indice: number, destinosFicticios: number[] = []): string {
  return `D${indice + 1}${destinosFicticios.includes(indice) ? ' F' : ''}`;
}

export function explicarPasoTransporte(
  paso: Paso,
  costos: number[][],
  origenesFicticios: number[] = [],
  destinosFicticios: number[] = []
): string {
  const celda = paso.celdasResaltadas[0];
  if (!celda) {
    return 'En este paso se actualiza el estado de la matriz. Revisa las ofertas y demandas restantes para identificar las filas o columnas que ya quedaron cerradas.';
  }

  const asignacion = paso.asignaciones[celda.fila]?.[celda.columna] ?? 0;
  const costo = costos[celda.fila]?.[celda.columna] ?? 0;
  const origen = etiquetaOrigen(celda.fila, origenesFicticios);
  const destino = etiquetaDestino(celda.columna, destinosFicticios);
  const filaCerrada = estaAgotado(paso.ofertaRestante[celda.fila]);
  const columnaCerrada = estaAgotado(paso.demandaRestante[celda.columna]);
  const esFicticio = origenesFicticios.includes(celda.fila) || destinosFicticios.includes(celda.columna);
  const usaVogel = Boolean(paso.penalizacionesVogel);
  const cierre = [
    filaCerrada ? `${origen} queda sin oferta restante` : null,
    columnaCerrada ? `${destino} queda sin demanda restante` : null,
  ].filter(Boolean).join(' y ');

  return [
    `Se asignan ${formatearNumeroTransporte(asignacion)} unidades desde ${origen} hacia ${destino}.`,
    `El costo usado en esa casilla es ${formatearNumeroTransporte(costo)}, por eso este paso suma ${formatearNumeroTransporte(asignacion * costo)} al costo acumulado.`,
    cierre
      ? `Después de asignar, ${cierre}. Las filas o columnas cerradas aparecen con un fondo diferenciado.`
      : 'Después de asignar todavía queda oferta y demanda en esa fila o columna.',
    esFicticio
      ? 'La etiqueta F indica una fila o columna ficticia creada por el balanceo. Si recibe unidades con costo 0, representa el sobrante o faltante necesario para equilibrar el modelo.'
      : null,
    usaVogel
      ? 'Las penalidades visibles se calcularon al inicio de esta iteración y son las que determinaron la fila o columna seleccionada; la oferta y demanda restantes muestran el estado después de realizar la asignación.'
      : null,
  ].filter(Boolean).join(' ');
}
