/**
 * =====================================================================
 * ALGORITMOS DE TRANSPORTE
 * Universidad Laica Eloy Alfaro de Manabí (ULEAM)
 * 
 * Este archivo contiene la implementación de los tres métodos de transporte:
 * 1. Esquina Noroeste
 * 2. Costo Mínimo  
 * 3. Aproximación de Vogel (VAM)
 * 
 * CÓMO MODIFICAR:
 * - Para cambiar límites de matriz, modifique LIMITES_METODO
 * - Para ajustar tolerancia numérica, modifique TOLERANCIA_FLOTANTE
 * =====================================================================
 */

/* =====================================================================
   TIPOS E INTERFACES
   ===================================================================== */

/**
 * Representa un paso individual en la resolución del problema.
 * Cada paso muestra el estado actual de la solución.
 */
export interface Paso {
  /** Número de iteración (empieza en 0) */
  iteracion: number;
  /** Descripción textual de lo que ocurre en este paso */
  descripcion: string;
  /** Celdas que se resaltan en la tabla (fila, columna) */
  celdasResaltadas: { fila: number; columna: number }[];
  /** Estado actual de las asignaciones */
  asignaciones: number[][];
  /** Oferta restante en cada origen */
  ofertaRestante: number[];
  /** Demanda restante en cada destino */
  demandaRestante: number[];
  /** Costo acumulado hasta este paso */
  costo: number;
}

/**
 * Resultado completo de resolver un problema de transporte.
 */
export interface ResultadoTransporte {
  /** Matriz de asignaciones finales */
  asignaciones: number[][];
  /** Costo total de la solución */
  costoTotal: number;
  /** Lista de pasos para visualización */
  pasos: Paso[];
}

/**
 * Resultado de validar un problema de transporte.
 */
export interface ValidacionTransporte {
  /** Indica si el problema es válido */
  esValido: boolean;
  /** Lista de errores encontrados */
  errores: string[];
}

/* =====================================================================
   CONSTANTES DE CONFIGURACIÓN
   Modifique estos valores según los requisitos del proyecto
   ===================================================================== */

/** Tamaño máximo absoluto de la matriz (10x10 según informe) */
export const TAMANO_MAXIMO_MATRIZ = 10;

/** Valor máximo permitido para costos, oferta y demanda */
const VALOR_NUMERICO_MAXIMO = 1_000_000;

/** Tolerancia para comparaciones de punto flotante */
const TOLERANCIA_FLOTANTE = 1e-9;

/**
 * Límites recomendados por método para mantener claridad visual.
 * Según el informe: máximo 10x10, pero se recomienda menos para claridad.
 */
export const LIMITES_METODO = {
  noroeste: { maxFilas: 10, maxColumnas: 10 },
  costoMinimo: { maxFilas: 10, maxColumnas: 10 },
  vogel: { maxFilas: 10, maxColumnas: 10 },
} as const;

/* =====================================================================
   FUNCIONES AUXILIARES
   ===================================================================== */

/**
 * Crea una matriz vacía para almacenar asignaciones.
 * @param filas - Número de filas (orígenes)
 * @param columnas - Número de columnas (destinos)
 */
function crearMatrizVacia(filas: number, columnas: number): number[][] {
  return Array(filas)
    .fill(0)
    .map(() => Array(columnas).fill(0));
}

/**
 * Clona una matriz de asignaciones para guardar el estado sin modificar el original.
 * @param asignaciones - Matriz a clonar
 */
function clonarAsignaciones(asignaciones: number[][]): number[][] {
  return asignaciones.map((fila) => [...fila]);
}

/**
 * Verifica si un valor es numérico, finito y no negativo.
 * @param valor - Valor a verificar
 */
function esNumeroNoNegativoFinito(valor: number): boolean {
  return Number.isFinite(valor) && valor >= 0;
}

/**
 * Normaliza valores muy cercanos a cero para evitar errores de punto flotante.
 * @param valor - Valor a normalizar
 */
function normalizarCero(valor: number): number {
  return Math.abs(valor) < TOLERANCIA_FLOTANTE ? 0 : valor;
}

/* =====================================================================
   VALIDACIÓN DEL PROBLEMA
   ===================================================================== */

/**
 * Valida que el problema de transporte cumpla con todas las reglas.
 * Verifica: dimensiones, balance, valores negativos, rangos máximos.
 * 
 * @param costos - Matriz de costos unitarios
 * @param oferta - Vector de ofertas por origen
 * @param demanda - Vector de demandas por destino
 * @returns Objeto con resultado de validación y errores encontrados
 */
export function validarProblemaTransporte(
  costos: number[][],
  oferta: number[],
  demanda: number[]
): ValidacionTransporte {
  const errores: string[] = [];

  // Verificar que la matriz existe y tiene contenido
  if (!Array.isArray(costos) || costos.length === 0 || !Array.isArray(costos[0]) || costos[0].length === 0) {
    errores.push('La matriz de costos debe tener al menos 1 origen y 1 destino.');
    return { esValido: false, errores };
  }

  const filas = costos.length;
  const columnas = costos[0].length;

  // Verificar tamaño máximo de matriz
  if (filas > TAMANO_MAXIMO_MATRIZ || columnas > TAMANO_MAXIMO_MATRIZ) {
    errores.push(`El tamaño máximo permitido es ${TAMANO_MAXIMO_MATRIZ}x${TAMANO_MAXIMO_MATRIZ}.`);
  }

  // Verificar consistencia de dimensiones
  if (oferta.length !== filas) {
    errores.push('La cantidad de ofertas no coincide con la cantidad de orígenes.');
  }

  if (demanda.length !== columnas) {
    errores.push('La cantidad de demandas no coincide con la cantidad de destinos.');
  }

  // Verificar que la matriz es rectangular
  for (let i = 0; i < filas; i++) {
    if (!Array.isArray(costos[i]) || costos[i].length !== columnas) {
      errores.push('La matriz de costos debe ser rectangular.');
      break;
    }
  }

  // Validar cada costo individual
  for (let i = 0; i < filas; i++) {
    for (let j = 0; j < columnas; j++) {
      const valor = costos[i][j];
      if (!esNumeroNoNegativoFinito(valor)) {
        errores.push(`Costo inválido en O${i + 1}-D${j + 1}. Solo se permiten valores no negativos.`);
      } else if (valor > VALOR_NUMERICO_MAXIMO) {
        errores.push(`Costo fuera de rango en O${i + 1}-D${j + 1}. Máximo permitido: ${VALOR_NUMERICO_MAXIMO}.`);
      }
    }
  }

  // Validar ofertas
  for (let i = 0; i < oferta.length; i++) {
    const valor = oferta[i];
    if (!esNumeroNoNegativoFinito(valor)) {
      errores.push(`Oferta inválida en O${i + 1}. Solo se permiten valores no negativos.`);
    } else if (valor > VALOR_NUMERICO_MAXIMO) {
      errores.push(`Oferta fuera de rango en O${i + 1}. Máximo permitido: ${VALOR_NUMERICO_MAXIMO}.`);
    }
  }

  // Validar demandas
  for (let j = 0; j < demanda.length; j++) {
    const valor = demanda[j];
    if (!esNumeroNoNegativoFinito(valor)) {
      errores.push(`Demanda inválida en D${j + 1}. Solo se permiten valores no negativos.`);
    } else if (valor > VALOR_NUMERICO_MAXIMO) {
      errores.push(`Demanda fuera de rango en D${j + 1}. Máximo permitido: ${VALOR_NUMERICO_MAXIMO}.`);
    }
  }

  // Verificar que hay oferta y demanda positivas
  const totalOferta = oferta.reduce((suma, valor) => suma + valor, 0);
  const totalDemanda = demanda.reduce((suma, valor) => suma + valor, 0);

  if (totalOferta <= TOLERANCIA_FLOTANTE || totalDemanda <= TOLERANCIA_FLOTANTE) {
    errores.push('La oferta y demanda totales deben ser mayores que 0.');
  }

  // Verificar balance (oferta total = demanda total)
  if (Math.abs(totalOferta - totalDemanda) > TOLERANCIA_FLOTANTE) {
    errores.push('El problema debe estar balanceado: oferta total debe ser igual a demanda total.');
  }

  return {
    esValido: errores.length === 0,
    errores,
  };
}

/* =====================================================================
   FUNCIONES AUXILIARES PARA MÉTODOS
   ===================================================================== */

/**
 * Encuentra la celda con el menor costo entre las celdas activas.
 * Usado por el método de Costo Mínimo.
 */
function buscarCeldaMenorCosto(
  costos: number[][],
  ofertaRestante: number[],
  demandaRestante: number[]
): { fila: number; columna: number; costo: number } | null {
  let mejor: { fila: number; columna: number; costo: number; capacidad: number } | null = null;

  for (let i = 0; i < costos.length; i++) {
    if (ofertaRestante[i] <= 0) continue;
    for (let j = 0; j < costos[0].length; j++) {
      if (demandaRestante[j] <= 0) continue;

      const costoActual = costos[i][j];
      const capacidadActual = Math.min(ofertaRestante[i], demandaRestante[j]);

      // Seleccionar si es mejor: menor costo, o igual costo con mayor capacidad
      if (
        mejor === null ||
        costoActual < mejor.costo ||
        (costoActual === mejor.costo && capacidadActual > mejor.capacidad) ||
        (costoActual === mejor.costo && capacidadActual === mejor.capacidad && (i < mejor.fila || (i === mejor.fila && j < mejor.columna)))
      ) {
        mejor = { fila: i, columna: j, costo: costoActual, capacidad: capacidadActual };
      }
    }
  }

  return mejor ? { fila: mejor.fila, columna: mejor.columna, costo: mejor.costo } : null;
}

/**
 * Representa un candidato para el método de Vogel.
 */
interface CandidatoVogel {
  tipo: 'fila' | 'columna';
  indice: number;
  penalizacion: number;
  costoMinimo: number;
  filaObjetivo: number;
  columnaObjetivo: number;
  capacidadObjetivo: number;
}

/**
 * Construye la lista de candidatos con sus penalizaciones para Vogel.
 * La penalización es la diferencia entre los dos costos más bajos.
 */
function construirCandidatosVogel(
  costos: number[][],
  ofertaRestante: number[],
  demandaRestante: number[]
): CandidatoVogel[] {
  const filas = costos.length;
  const columnas = costos[0].length;
  const candidatos: CandidatoVogel[] = [];

  // Calcular penalizaciones por fila
  for (let i = 0; i < filas; i++) {
    if (ofertaRestante[i] <= 0) continue;

    const columnasActivas = Array.from({ length: columnas }, (_, j) => j).filter((j) => demandaRestante[j] > 0);
    if (columnasActivas.length === 0) continue;

    const ordenadoPorCosto = columnasActivas
      .map((j) => ({ columna: j, costo: costos[i][j] }))
      .sort((a, b) => a.costo - b.costo || a.columna - b.columna);

    const masBajo = ordenadoPorCosto[0];
    const segundoMasBajo = ordenadoPorCosto[1];
    const penalizacion = segundoMasBajo ? segundoMasBajo.costo - masBajo.costo : masBajo.costo;

    candidatos.push({
      tipo: 'fila',
      indice: i,
      penalizacion,
      costoMinimo: masBajo.costo,
      filaObjetivo: i,
      columnaObjetivo: masBajo.columna,
      capacidadObjetivo: Math.min(ofertaRestante[i], demandaRestante[masBajo.columna]),
    });
  }

  // Calcular penalizaciones por columna
  for (let j = 0; j < columnas; j++) {
    if (demandaRestante[j] <= 0) continue;

    const filasActivas = Array.from({ length: filas }, (_, i) => i).filter((i) => ofertaRestante[i] > 0);
    if (filasActivas.length === 0) continue;

    const ordenadoPorCosto = filasActivas
      .map((i) => ({ fila: i, costo: costos[i][j] }))
      .sort((a, b) => a.costo - b.costo || a.fila - b.fila);

    const masBajo = ordenadoPorCosto[0];
    const segundoMasBajo = ordenadoPorCosto[1];
    const penalizacion = segundoMasBajo ? segundoMasBajo.costo - masBajo.costo : masBajo.costo;

    candidatos.push({
      tipo: 'columna',
      indice: j,
      penalizacion,
      costoMinimo: masBajo.costo,
      filaObjetivo: masBajo.fila,
      columnaObjetivo: j,
      capacidadObjetivo: Math.min(ofertaRestante[masBajo.fila], demandaRestante[j]),
    });
  }

  return candidatos;
}

/* =====================================================================
   MÉTODO DE LA ESQUINA NOROESTE
   
   Descripción:
   Comienza en la celda superior izquierda (esquina noroeste) y asigna
   la mayor cantidad posible. Luego avanza hacia la derecha o hacia abajo
   según se agote primero la demanda o la oferta.
   
   Ventajas: Simple y rápido
   Desventajas: No garantiza la solución óptima
   ===================================================================== */

export function esquinaNoroeste(
  costos: number[][],
  oferta: number[],
  demanda: number[]
): ResultadoTransporte {
  // Validar el problema antes de resolver
  const validacion = validarProblemaTransporte(costos, oferta, demanda);
  if (!validacion.esValido) {
    throw new Error(validacion.errores[0]);
  }

  const filas = costos.length;
  const columnas = costos[0].length;
  const asignaciones = crearMatrizVacia(filas, columnas);
  const ofertaRestante = [...oferta];
  const demandaRestante = [...demanda];
  const pasos: Paso[] = [];

  let costoTotal = 0;
  let i = 0; // Índice de fila actual
  let j = 0; // Índice de columna actual
  let iteracion = 0;

  // Recorrer la matriz desde la esquina noroeste
  while (i < filas && j < columnas) {
    // Si no queda oferta en la fila actual, pasar a la siguiente
    if (ofertaRestante[i] <= TOLERANCIA_FLOTANTE) {
      i++;
      continue;
    }
    // Si no queda demanda en la columna actual, pasar a la siguiente
    if (demandaRestante[j] <= TOLERANCIA_FLOTANTE) {
      j++;
      continue;
    }

    // Asignar la cantidad máxima posible en la celda actual
    const asignacion = Math.min(ofertaRestante[i], demandaRestante[j]);
    asignaciones[i][j] += asignacion;
    costoTotal += asignacion * costos[i][j];

    // Actualizar ofertas y demandas restantes
    ofertaRestante[i] = normalizarCero(ofertaRestante[i] - asignacion);
    demandaRestante[j] = normalizarCero(demandaRestante[j] - asignacion);

    // Registrar el paso para visualización
    pasos.push({
      iteracion: iteracion++,
      descripcion: `Asignar ${asignacion} unidades de O${i + 1} a D${j + 1} (costo unitario: $${costos[i][j]})`,
      celdasResaltadas: [{ fila: i, columna: j }],
      asignaciones: clonarAsignaciones(asignaciones),
      ofertaRestante: [...ofertaRestante],
      demandaRestante: [...demandaRestante],
      costo: costoTotal,
    });

    // Avanzar según qué se haya agotado
    if (ofertaRestante[i] <= TOLERANCIA_FLOTANTE) i++;
    if (demandaRestante[j] <= TOLERANCIA_FLOTANTE) j++;
  }

  return { asignaciones, costoTotal, pasos };
}

/* =====================================================================
   MÉTODO DE COSTO MÍNIMO
   
   Descripción:
   En cada iteración, busca la celda activa con el menor costo unitario
   y asigna la mayor cantidad posible en esa celda.
   
   Ventajas: Mejor que esquina noroeste, considera costos
   Desventajas: No siempre da la solución óptima
   ===================================================================== */

export function costoMinimo(
  costos: number[][],
  oferta: number[],
  demanda: number[]
): ResultadoTransporte {
  // Validar el problema antes de resolver
  const validacion = validarProblemaTransporte(costos, oferta, demanda);
  if (!validacion.esValido) {
    throw new Error(validacion.errores[0]);
  }

  const filas = costos.length;
  const columnas = costos[0].length;
  const asignaciones = crearMatrizVacia(filas, columnas);
  const ofertaRestante = [...oferta];
  const demandaRestante = [...demanda];
  const pasos: Paso[] = [];

  let costoTotal = 0;
  let iteracion = 0;

  // Continuar mientras haya oferta y demanda disponibles
  while (ofertaRestante.some(s => s > 0) && demandaRestante.some(d => d > 0)) {
    // Encontrar la celda con el menor costo
    const mejorCelda = buscarCeldaMenorCosto(costos, ofertaRestante, demandaRestante);
    if (!mejorCelda) break;

    // Asignar la cantidad máxima posible
    const asignacion = Math.min(ofertaRestante[mejorCelda.fila], demandaRestante[mejorCelda.columna]);
    asignaciones[mejorCelda.fila][mejorCelda.columna] += asignacion;
    costoTotal += asignacion * costos[mejorCelda.fila][mejorCelda.columna];

    // Actualizar ofertas y demandas restantes
    ofertaRestante[mejorCelda.fila] = normalizarCero(ofertaRestante[mejorCelda.fila] - asignacion);
    demandaRestante[mejorCelda.columna] = normalizarCero(demandaRestante[mejorCelda.columna] - asignacion);

    // Registrar el paso
    pasos.push({
      iteracion: iteracion++,
      descripcion: `Seleccionar celda de costo mínimo ($${mejorCelda.costo}): Asignar ${asignacion} unidades de O${mejorCelda.fila + 1} a D${mejorCelda.columna + 1}`,
      celdasResaltadas: [{ fila: mejorCelda.fila, columna: mejorCelda.columna }],
      asignaciones: clonarAsignaciones(asignaciones),
      ofertaRestante: [...ofertaRestante],
      demandaRestante: [...demandaRestante],
      costo: costoTotal,
    });
  }

  return { asignaciones, costoTotal, pasos };
}

/* =====================================================================
   MÉTODO DE APROXIMACIÓN DE VOGEL (VAM)
   
   Descripción:
   Calcula "penalizaciones" para cada fila y columna (diferencia entre
   los dos costos más bajos). Selecciona la fila/columna con mayor
   penalización y asigna en la celda de menor costo de esa fila/columna.
   
   Ventajas: Generalmente da soluciones óptimas o muy cercanas
   Desventajas: Más complejo de calcular
   ===================================================================== */

export function aproximacionVogel(
  costos: number[][],
  oferta: number[],
  demanda: number[]
): ResultadoTransporte {
  // Validar el problema antes de resolver
  const validacion = validarProblemaTransporte(costos, oferta, demanda);
  if (!validacion.esValido) {
    throw new Error(validacion.errores[0]);
  }

  const filas = costos.length;
  const columnas = costos[0].length;
  const asignaciones = crearMatrizVacia(filas, columnas);
  const ofertaRestante = [...oferta];
  const demandaRestante = [...demanda];
  const pasos: Paso[] = [];

  let costoTotal = 0;
  let iteracion = 0;

  // Continuar mientras haya oferta y demanda disponibles
  while (ofertaRestante.some(s => s > 0) && demandaRestante.some(d => d > 0)) {
    // Construir lista de candidatos con penalizaciones
    const candidatos = construirCandidatosVogel(costos, ofertaRestante, demandaRestante);
    if (candidatos.length === 0) break;

    // Seleccionar el candidato con mayor penalización
    // Desempate: menor costo, mayor capacidad, tipo fila primero, menor índice
    const seleccionado = candidatos.sort((a, b) => {
      if (b.penalizacion !== a.penalizacion) return b.penalizacion - a.penalizacion;
      if (a.costoMinimo !== b.costoMinimo) return a.costoMinimo - b.costoMinimo;
      if (b.capacidadObjetivo !== a.capacidadObjetivo) return b.capacidadObjetivo - a.capacidadObjetivo;
      if (a.tipo !== b.tipo) return a.tipo === 'fila' ? -1 : 1;
      return a.indice - b.indice;
    })[0];

    // Asignar en la celda seleccionada
    const asignacion = Math.min(ofertaRestante[seleccionado.filaObjetivo], demandaRestante[seleccionado.columnaObjetivo]);
    asignaciones[seleccionado.filaObjetivo][seleccionado.columnaObjetivo] += asignacion;
    costoTotal += asignacion * costos[seleccionado.filaObjetivo][seleccionado.columnaObjetivo];

    // Actualizar ofertas y demandas restantes
    ofertaRestante[seleccionado.filaObjetivo] = normalizarCero(ofertaRestante[seleccionado.filaObjetivo] - asignacion);
    demandaRestante[seleccionado.columnaObjetivo] = normalizarCero(demandaRestante[seleccionado.columnaObjetivo] - asignacion);

    // Registrar el paso
    pasos.push({
      iteracion: iteracion++,
      descripcion: `Penalización máxima (${seleccionado.penalizacion}) en ${seleccionado.tipo === 'fila' ? 'fila' : 'columna'} ${seleccionado.indice + 1}. Asignar ${asignacion} unidades de O${seleccionado.filaObjetivo + 1} a D${seleccionado.columnaObjetivo + 1} (costo: $${seleccionado.costoMinimo})`,
      celdasResaltadas: [{ fila: seleccionado.filaObjetivo, columna: seleccionado.columnaObjetivo }],
      asignaciones: clonarAsignaciones(asignaciones),
      ofertaRestante: [...ofertaRestante],
      demandaRestante: [...demandaRestante],
      costo: costoTotal,
    });
  }

  return { asignaciones, costoTotal, pasos };
}
