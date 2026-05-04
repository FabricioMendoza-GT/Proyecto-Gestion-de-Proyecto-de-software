import { Step } from '../components/StepByStepPanel';

export interface TransportResult {
  allocations: number[][];
  totalCost: number;
  steps: Step[];
}

export interface TransportValidation {
  isValid: boolean;
  errors: string[];
}

export const MAX_MATRIX_SIZE = 8;
const MAX_NUMERIC_VALUE = 1_000_000;
const FLOAT_TOLERANCE = 1e-9;

export const METHOD_LIMITS = {
  northwest: { maxRows: 6, maxCols: 6 },
  minimumCost: { maxRows: 6, maxCols: 6 },
  vogel: { maxRows: 5, maxCols: 5 },
} as const;

// Crea una matriz vacia para ir guardando las asignaciones de cada metodo.
function buildEmptyAllocations(rows: number, cols: number): number[][] {
  return Array(rows)
    .fill(0)
    .map(() => Array(cols).fill(0));
}

// Clona la matriz de asignaciones para guardar cada paso sin perder el estado anterior.
function cloneAllocations(allocations: number[][]): number[][] {
  return allocations.map((row) => [...row]);
}

// Valida que un valor sea numerico, finito y no negativo.
function isNonNegativeFinite(value: number): boolean {
  return Number.isFinite(value) && value >= 0;
}

function normalizeZero(value: number): number {
  return Math.abs(value) < FLOAT_TOLERANCE ? 0 : value;
}

// Valida que el problema de transporte pueda resolverse con las reglas de la aplicacion.
// Aqui se revisan dimensiones, balance, valores negativos y rangos maximos.
export function validateTransportProblem(
  costs: number[][],
  supply: number[],
  demand: number[]
): TransportValidation {
  const errors: string[] = [];

  if (!Array.isArray(costs) || costs.length === 0 || !Array.isArray(costs[0]) || costs[0].length === 0) {
    errors.push('La matriz de costos debe tener al menos 1 origen y 1 destino.');
    return { isValid: false, errors };
  }

  const rows = costs.length;
  const cols = costs[0].length;

  if (rows > MAX_MATRIX_SIZE || cols > MAX_MATRIX_SIZE) {
    errors.push(`El tamaño máximo absoluto permitido es ${MAX_MATRIX_SIZE}x${MAX_MATRIX_SIZE}.`);
  }

  if (supply.length !== rows) {
    errors.push('La cantidad de ofertas no coincide con la cantidad de orígenes.');
  }

  if (demand.length !== cols) {
    errors.push('La cantidad de demandas no coincide con la cantidad de destinos.');
  }

  for (let i = 0; i < rows; i++) {
    if (!Array.isArray(costs[i]) || costs[i].length !== cols) {
      errors.push('La matriz de costos debe ser rectangular.');
      break;
    }
  }

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const value = costs[i][j];
      if (!isNonNegativeFinite(value)) {
        errors.push(`Costo inválido en O${i + 1}-D${j + 1}. Solo se permiten valores no negativos.`);
      } else if (value > MAX_NUMERIC_VALUE) {
        errors.push(`Costo fuera de rango en O${i + 1}-D${j + 1}. Máximo permitido: ${MAX_NUMERIC_VALUE}.`);
      }
    }
  }

  for (let i = 0; i < supply.length; i++) {
    const value = supply[i];
    if (!isNonNegativeFinite(value)) {
      errors.push(`Oferta inválida en O${i + 1}. Solo se permiten valores no negativos.`);
    } else if (value > MAX_NUMERIC_VALUE) {
      errors.push(`Oferta fuera de rango en O${i + 1}. Máximo permitido: ${MAX_NUMERIC_VALUE}.`);
    }
  }

  for (let j = 0; j < demand.length; j++) {
    const value = demand[j];
    if (!isNonNegativeFinite(value)) {
      errors.push(`Demanda inválida en D${j + 1}. Solo se permiten valores no negativos.`);
    } else if (value > MAX_NUMERIC_VALUE) {
      errors.push(`Demanda fuera de rango en D${j + 1}. Máximo permitido: ${MAX_NUMERIC_VALUE}.`);
    }
  }

  const totalSupply = supply.reduce((sum, value) => sum + value, 0);
  const totalDemand = demand.reduce((sum, value) => sum + value, 0);

  if (totalSupply <= FLOAT_TOLERANCE || totalDemand <= FLOAT_TOLERANCE) {
    errors.push('La oferta y demanda totales deben ser mayores que 0.');
  }

  if (Math.abs(totalSupply - totalDemand) > FLOAT_TOLERANCE) {
    errors.push('El problema debe estar balanceado: oferta total debe ser igual a demanda total.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Metodo de apoyo para el costo minimo.
// Recorre todas las celdas activas y elige la de menor costo disponible.
function pickCheapestCell(
  costs: number[][],
  remainingSupply: number[],
  remainingDemand: number[]
): { row: number; col: number; cost: number } | null {
  let best: { row: number; col: number; cost: number; capacity: number } | null = null;

  for (let i = 0; i < costs.length; i++) {
    if (remainingSupply[i] <= 0) continue;
    for (let j = 0; j < costs[0].length; j++) {
      if (remainingDemand[j] <= 0) continue;

      const candidateCost = costs[i][j];
      const candidateCapacity = Math.min(remainingSupply[i], remainingDemand[j]);

      if (
        best === null ||
        candidateCost < best.cost ||
        (candidateCost === best.cost && candidateCapacity > best.capacity) ||
        (candidateCost === best.cost && candidateCapacity === best.capacity && (i < best.row || (i === best.row && j < best.col)))
      ) {
        best = { row: i, col: j, cost: candidateCost, capacity: candidateCapacity };
      }
    }
  }

  return best ? { row: best.row, col: best.col, cost: best.cost } : null;
}

interface VogelCandidate {
  type: 'row' | 'col';
  index: number;
  penalty: number;
  minCost: number;
  targetRow: number;
  targetCol: number;
  targetCapacity: number;
}

// Calcula candidatos para el metodo de Vogel.
// Se evalua cada fila y columna activa para obtener su penalizacion.
function buildVogelCandidates(
  costs: number[][],
  remainingSupply: number[],
  remainingDemand: number[]
): VogelCandidate[] {
  const rows = costs.length;
  const cols = costs[0].length;
  const candidates: VogelCandidate[] = [];

  for (let i = 0; i < rows; i++) {
    if (remainingSupply[i] <= 0) continue;

    const activeCols = Array.from({ length: cols }, (_, j) => j).filter((j) => remainingDemand[j] > 0);
    if (activeCols.length === 0) continue;

    const sortedByCost = activeCols
      .map((j) => ({ col: j, cost: costs[i][j] }))
      .sort((a, b) => a.cost - b.cost || a.col - b.col);

    const cheapest = sortedByCost[0];
    const secondCheapest = sortedByCost[1];
    const penalty = secondCheapest ? secondCheapest.cost - cheapest.cost : cheapest.cost;

    candidates.push({
      type: 'row',
      index: i,
      penalty,
      minCost: cheapest.cost,
      targetRow: i,
      targetCol: cheapest.col,
      targetCapacity: Math.min(remainingSupply[i], remainingDemand[cheapest.col]),
    });
  }

  for (let j = 0; j < cols; j++) {
    if (remainingDemand[j] <= 0) continue;

    const activeRows = Array.from({ length: rows }, (_, i) => i).filter((i) => remainingSupply[i] > 0);
    if (activeRows.length === 0) continue;

    const sortedByCost = activeRows
      .map((i) => ({ row: i, cost: costs[i][j] }))
      .sort((a, b) => a.cost - b.cost || a.row - b.row);

    const cheapest = sortedByCost[0];
    const secondCheapest = sortedByCost[1];
    const penalty = secondCheapest ? secondCheapest.cost - cheapest.cost : cheapest.cost;

    candidates.push({
      type: 'col',
      index: j,
      penalty,
      minCost: cheapest.cost,
      targetRow: cheapest.row,
      targetCol: j,
      targetCapacity: Math.min(remainingSupply[cheapest.row], remainingDemand[j]),
    });
  }

  return candidates;
}

// Metodo de la esquina noroeste.
// Arranca en la celda superior izquierda y avanza hacia la derecha o hacia abajo
// segun se agote primero la demanda o la oferta.
export function northwestCorner(
  costs: number[][],
  supply: number[],
  demand: number[]
): TransportResult {
  const validation = validateTransportProblem(costs, supply, demand);
  if (!validation.isValid) {
    throw new Error(validation.errors[0]);
  }

  const rows = costs.length;
  const cols = costs[0].length;
  const allocations = buildEmptyAllocations(rows, cols);
  const remainingSupply = [...supply];
  const remainingDemand = [...demand];
  const steps: Step[] = [];

  let totalCost = 0;
  let i = 0;
  let j = 0;
  let iteration = 0;

  while (i < rows && j < cols) {
    // Si ya no queda oferta en la fila actual, bajamos a la siguiente.
    if (remainingSupply[i] <= FLOAT_TOLERANCE) {
      i++;
      continue;
    }
    // Si ya no queda demanda en la columna actual, avanzamos a la siguiente.
    if (remainingDemand[j] <= FLOAT_TOLERANCE) {
      j++;
      continue;
    }

    // Asignamos la maxima cantidad posible en la celda actual.
    const allocation = Math.min(remainingSupply[i], remainingDemand[j]);
    allocations[i][j] += allocation;
    totalCost += allocation * costs[i][j];

    remainingSupply[i] = normalizeZero(remainingSupply[i] - allocation);
    remainingDemand[j] = normalizeZero(remainingDemand[j] - allocation);

    steps.push({
      iteration: iteration++,
      description: `Asignar ${allocation} unidades de O${i + 1} a D${j + 1} (costo unitario: $${costs[i][j]})`,
      highlightedCells: [{ row: i, col: j }],
      allocations: cloneAllocations(allocations),
      remainingSupply: [...remainingSupply],
      remainingDemand: [...remainingDemand],
      cost: totalCost,
    });

    // Movemos el puntero segun se haya agotado oferta o demanda.
    if (remainingSupply[i] <= FLOAT_TOLERANCE) i++;
    if (remainingDemand[j] <= FLOAT_TOLERANCE) j++;
  }

  return { allocations, totalCost, steps };
}

// Metodo de costo minimo.
// En cada iteracion busca la celda activa con menor costo unitario disponible.
export function minimumCost(
  costs: number[][],
  supply: number[],
  demand: number[]
): TransportResult {
  const validation = validateTransportProblem(costs, supply, demand);
  if (!validation.isValid) {
    throw new Error(validation.errors[0]);
  }

  const rows = costs.length;
  const cols = costs[0].length;
  const allocations = buildEmptyAllocations(rows, cols);
  const remainingSupply = [...supply];
  const remainingDemand = [...demand];
  const steps: Step[] = [];

  let totalCost = 0;
  let iteration = 0;

  while (remainingSupply.some(s => s > 0) && remainingDemand.some(d => d > 0)) {
    // Selecciona la mejor celda actual entre las filas y columnas que siguen activas.
    const bestCell = pickCheapestCell(costs, remainingSupply, remainingDemand);
    if (!bestCell) break;

    // Asigna la maxima cantidad posible en esa celda de menor costo.
    const allocation = Math.min(remainingSupply[bestCell.row], remainingDemand[bestCell.col]);
    allocations[bestCell.row][bestCell.col] += allocation;
    totalCost += allocation * costs[bestCell.row][bestCell.col];

    remainingSupply[bestCell.row] = normalizeZero(remainingSupply[bestCell.row] - allocation);
    remainingDemand[bestCell.col] = normalizeZero(remainingDemand[bestCell.col] - allocation);

    steps.push({
      iteration: iteration++,
      description: `Seleccionar celda de costo mínimo ($${bestCell.cost}): Asignar ${allocation} unidades de O${bestCell.row + 1} a D${bestCell.col + 1}`,
      highlightedCells: [{ row: bestCell.row, col: bestCell.col }],
      allocations: cloneAllocations(allocations),
      remainingSupply: [...remainingSupply],
      remainingDemand: [...remainingDemand],
      cost: totalCost,
    });
  }

  return { allocations, totalCost, steps };
}

// Metodo de aproximacion de Vogel.
// Calcula penalizaciones por fila y columna; luego elige la mayor penalizacion
// para asignar en la celda de menor costo asociada.
export function vogelApproximation(
  costs: number[][],
  supply: number[],
  demand: number[]
): TransportResult {
  const validation = validateTransportProblem(costs, supply, demand);
  if (!validation.isValid) {
    throw new Error(validation.errors[0]);
  }

  const rows = costs.length;
  const cols = costs[0].length;
  const allocations = buildEmptyAllocations(rows, cols);
  const remainingSupply = [...supply];
  const remainingDemand = [...demand];
  const steps: Step[] = [];

  let totalCost = 0;
  let iteration = 0;

  while (remainingSupply.some(s => s > 0) && remainingDemand.some(d => d > 0)) {
    // Construye la lista de filas y columnas activas con su penalizacion.
    const candidates = buildVogelCandidates(costs, remainingSupply, remainingDemand);
    if (candidates.length === 0) break;

    // Elige la candidata con mayor penalizacion y desempata por costo, capacidad y posicion.
    const selected = candidates.sort((a, b) => {
      if (b.penalty !== a.penalty) return b.penalty - a.penalty;
      if (a.minCost !== b.minCost) return a.minCost - b.minCost;
      if (b.targetCapacity !== a.targetCapacity) return b.targetCapacity - a.targetCapacity;
      if (a.type !== b.type) return a.type === 'row' ? -1 : 1;
      return a.index - b.index;
    })[0];

    // Asigna en la celda de menor costo de la fila o columna elegida.
    const allocation = Math.min(remainingSupply[selected.targetRow], remainingDemand[selected.targetCol]);
    allocations[selected.targetRow][selected.targetCol] += allocation;
    totalCost += allocation * costs[selected.targetRow][selected.targetCol];

    remainingSupply[selected.targetRow] = normalizeZero(remainingSupply[selected.targetRow] - allocation);
    remainingDemand[selected.targetCol] = normalizeZero(remainingDemand[selected.targetCol] - allocation);

    steps.push({
      iteration: iteration++,
      description: `Penalización máxima (${selected.penalty}) en ${selected.type === 'row' ? 'fila' : 'columna'} ${selected.index + 1}. Asignar ${allocation} unidades de O${selected.targetRow + 1} a D${selected.targetCol + 1} (costo: $${selected.minCost})`,
      highlightedCells: [{ row: selected.targetRow, col: selected.targetCol }],
      allocations: cloneAllocations(allocations),
      remainingSupply: [...remainingSupply],
      remainingDemand: [...remainingDemand],
      cost: totalCost,
    });
  }

  return { allocations, totalCost, steps };
}
