# Documentación completa: transportAlgorithms.ts

Este documento explica cada elemento del archivo `src/app/utils/transportAlgorithms.ts`, que contiene la lógica central de los algoritmos de transporte.

---

## Índice
1. [Imports](#imports)
2. [Interfaces](#interfaces)
3. [Constantes](#constantes)
4. [Funciones auxiliares privadas](#funciones-auxiliares-privadas)
5. [Funciones principales exportadas](#funciones-principales-exportadas)

---

## Imports

```typescript
import { Step } from '../components/StepByStepPanel';
```

**Explicación:**
- Importa la interfaz `Step` desde el componente `StepByStepPanel`.
- `Step` define la estructura de cada iteración/paso que se muestra al usuario en modo "Paso a Paso".
- Esto permite que el archivo de algoritmos y la interfaz compartan la misma estructura de datos.

---

## Interfaces

### 1. `TransportResult` (EXPORTADA)

```typescript
export interface TransportResult {
  allocations: number[][];
  totalCost: number;
  steps: Step[];
}
```

**Explicación:**
- Define el formato de salida que retornan todos los métodos de resolución.
- **`allocations: number[][]`**: matriz 2D con las asignaciones finales. `allocations[i][j]` es la cantidad asignada desde el origen `i` al destino `j`.
- **`totalCost: number`**: costo total de la solución (suma de todas las asignaciones multiplicadas por sus costos unitarios).
- **`steps: Step[]`**: array con todos los pasos del proceso (solo se llena si el usuario elige modo "Paso a Paso").

**Ejemplo:**
```typescript
{
  allocations: [[10, 0, 25], [0, 20, 30]],
  totalCost: 1350,
  steps: [
    { iteration: 0, description: "...", ... },
    { iteration: 1, description: "...", ... }
  ]
}
```

---

### 2. `TransportValidation` (EXPORTADA)

```typescript
export interface TransportValidation {
  isValid: boolean;
  errors: string[];
}
```

**Explicación:**
- Define el formato de retorno de la validación del problema.
- **`isValid: boolean`**: `true` si el problema es válido y se puede resolver, `false` si hay errores.
- **`errors: string[]`**: array de mensajes de error descriptivos. Si está vacío, el problema es válido.

**Ejemplo:**
```typescript
{
  isValid: false,
  errors: [
    "La matriz de costos debe tener al menos 1 origen y 1 destino.",
    "El problema debe estar balanceado: oferta total debe ser igual a demanda total."
  ]
}
```

---

### 3. `VogelCandidate` (NO EXPORTADA, interna)

```typescript
interface VogelCandidate {
  type: 'row' | 'col';
  index: number;
  penalty: number;
  minCost: number;
  targetRow: number;
  targetCol: number;
  targetCapacity: number;
}
```

**Explicación:**
- Define un candidato (fila o columna) en el método de Vogel.
- **`type: 'row' | 'col'`**: indica si es una fila o columna.
- **`index: number`**: número de fila (si type='row') o número de columna (si type='col').
- **`penalty: number`**: penalización calculada (diferencia entre los dos costos mínimos).
- **`minCost: number`**: costo unitario mínimo en esa fila/columna.
- **`targetRow: number`**: fila donde se debe hacer la asignación.
- **`targetCol: number`**: columna donde se debe hacer la asignación.
- **`targetCapacity: number`**: cantidad máxima que se puede asignar en esa celda.

---

## Constantes

### 1. `MAX_MATRIX_SIZE` (EXPORTADA)

```typescript
export const MAX_MATRIX_SIZE = 8;
```

**Explicación:**
- Límite absoluto máximo para filas o columnas de la matriz.
- La matriz no puede ser mayor que 8×8.
- Se usa como validación de seguridad en `validateTransportProblem()`.
- Es exportada porque se usa en `App.tsx` para mostrar límites al usuario.

---

### 2. `MAX_NUMERIC_VALUE` (PRIVADA)

```typescript
const MAX_NUMERIC_VALUE = 1_000_000;
```

**Explicación:**
- Valor máximo permitido para cualquier costo, oferta o demanda.
- Previene que el usuario ingrese números extremadamente grandes que causen errores o overflow.
- Se usa en `validateTransportProblem()` para validar cada celda.
- No se exporta porque solo se usa internamente en este archivo.

---

### 3. `FLOAT_TOLERANCE` (Privada)

```typescript
const FLOAT_TOLERANCE = 1e-9;
```

**Explicación:**
- Define un margen de tolerancia para comparaciones con números decimales.
- Valor: `0.000000001` (un nanonúmero).
- **¿Por qué es necesario?** En JavaScript, operaciones con decimales pueden generar errores de precisión. Por ejemplo: `0.1 + 0.2 !== 0.3`.
- Se usa en:
  - `normalizeZero()`: para eliminar valores muy cercanos a cero.
  - `validateTransportProblem()`: para validar que oferta y demanda estén balanceadas.
  - `northwestCorner()`, `minimumCost()`, `vogelApproximation()`: para comparar oferta/demanda restante.

**Ejemplo:**
```typescript
if (Math.abs(0.0000000001) < FLOAT_TOLERANCE) {
  // se trata como cero
}
```

---

### 4. `METHOD_LIMITS` (EXPORTADA)

```typescript
export const METHOD_LIMITS = {
  northwest: { maxRows: 6, maxCols: 6 },
  minimumCost: { maxRows: 6, maxCols: 6 },
  vogel: { maxRows: 5, maxCols: 5 },
} as const;
```

**Explicación:**
- Define los límites recomendados para cada método.
- **`northwest`**: máximo 6 orígenes y 6 destinos.
- **`minimumCost`**: máximo 6 orígenes y 6 destinos.
- **`vogel`**: máximo 5 orígenes y 5 destinos (más restrictivo porque es más complejo).
- `as const` asegura que los valores son literales (no pueden cambiar).
- Se exporta porque `App.tsx` la usa para:
  - Deshabilitar botones de agregar filas/columnas al alcanzar el límite.
  - Mostrar al usuario cuál es el límite para el método seleccionado.

---

## Funciones auxiliares privadas

Estas funciones NO se exportan (`no tienen export`), solo se usan internamente en este archivo.

### 1. `buildEmptyAllocations(rows, cols)`

```typescript
function buildEmptyAllocations(rows: number, cols: number): number[][] {
  return Array(rows)
    .fill(0)
    .map(() => Array(cols).fill(0));
}
```

**Parámetros:**
- `rows: number` - cantidad de filas (orígenes).
- `cols: number` - cantidad de columnas (destinos).

**Retorno:**
- Una matriz 2D de números, todas las celdas inicializadas en 0.

**Explicación:**
- Crea una matriz vacía para guardar las asignaciones.
- `Array(rows)` crea un array con `rows` espacios.
- `.fill(0)` llena los espacios con 0 (aunque no se usa el valor, solo el espacio).
- `.map(() => Array(cols).fill(0))` reemplaza cada elemento con un nuevo array de `cols` ceros.

**Ejemplo:**
```typescript
buildEmptyAllocations(2, 3)
// Retorna: [[0, 0, 0], [0, 0, 0]]
```

**Uso:**
Se llama al inicio de cada método (`northwestCorner`, `minimumCost`, `vogelApproximation`) para crear la matriz de asignaciones.

---

### 2. `cloneAllocations(allocations)`

```typescript
function cloneAllocations(allocations: number[][]): number[][] {
  return allocations.map((row) => [...row]);
}
```

**Parámetros:**
- `allocations: number[][]` - matriz de asignaciones a clonar.

**Retorno:**
- Una copia profunda (no referencia) de la matriz.

**Explicación:**
- Crea una copia independiente de la matriz.
- `.map((row) => [...row])` itera cada fila y crea un nuevo array con los mismos valores.
- Necesario porque JavaScript pasamatrics por referencia, no por valor.
- Si no clonaras, todos los pasos guardarían la misma referencia y mostrarían el resultado final.

**Ejemplo:**
```typescript
const orig = [[1, 2], [3, 4]];
const clon = cloneAllocations(orig);
clon[0][0] = 99;
console.log(orig[0][0]); // 1 (no cambió)
console.log(clon[0][0]); // 99 (es independiente)
```

**Uso:**
Se llama en cada iteración de los métodos para guardar el estado actual de asignaciones en `steps`.

---

### 3. `isNonNegativeFinite(value)`

```typescript
function isNonNegativeFinite(value: number): boolean {
  return Number.isFinite(value) && value >= 0;
}
```

**Parámetros:**
- `value: number` - valor a validar.

**Retorno:**
- `true` si el valor es un número finito no negativo, `false` en caso contrario.

**Explicación:**
- `Number.isFinite(value)` verifica que sea un número real (no Infinity, NaN, undefined, etc.).
- `value >= 0` verifica que no sea negativo.
- Ambas condiciones deben ser verdaderas.

**Ejemplo:**
```typescript
isNonNegativeFinite(10);      // true
isNonNegativeFinite(0);       // true
isNonNegativeFinite(-5);      // false (negativo)
isNonNegativeFinite(Infinity); // false (infinito)
isNonNegativeFinite(NaN);     // false (no es número)
```

**Uso:**
Se usa en `validateTransportProblem()` para validar cada costo, oferta y demanda.

---

### 4. `normalizeZero(value)`

```typescript
function normalizeZero(value: number): number {
  return Math.abs(value) < FLOAT_TOLERANCE ? 0 : value;
}
```

**Parámetros:**
- `value: number` - valor a normalizar.

**Retorno:**
- `0` si el valor es muy cercano a cero (menor que tolerancia), el valor original si no.

**Explicación:**
- Soluciona el problema de precisión en decimales.
- Si el valor es prácticamente cero (como `0.0000000001`), lo convierte en cero exacto.
- Previene comparaciones problemáticas como `remainingSupply[i] <= FLOAT_TOLERANCE` produciendo valores "casi cero".

**Ejemplo:**
```typescript
normalizeZero(0.0000000001); // 0
normalizeZero(0.1);           // 0.1
normalizeZero(5.00000000001); // 5.00000000001 (no cambia)
```

**Uso:**
Se usa en todos los métodos después de restar asignaciones: `remainingSupply[i] = normalizeZero(...)`

---

### 5. `validateTransportProblem(costs, supply, demand)` (EXPORTADA)

```typescript
export function validateTransportProblem(
  costs: number[][],
  supply: number[],
  demand: number[]
): TransportValidation { ... }
```

**Parámetros:**
- `costs: number[][]` - matriz de costos unitarios. `costs[i][j]` es el costo de transportar una unidad de origen `i` a destino `j`.
- `supply: number[]` - array con la oferta de cada origen. `supply[i]` es cuántas unidades tiene el origen `i`.
- `demand: number[]` - array con la demanda de cada destino. `demand[j]` es cuántas unidades necesita el destino `j`.

**Retorno:**
- Objeto `TransportValidation` con `isValid` y `errors`.

**Validaciones que realiza:**

1. **Matriz existe y no está vacía:**
   ```typescript
   if (!Array.isArray(costs) || costs.length === 0 || !Array.isArray(costs[0]) || costs[0].length === 0)
   ```

2. **Tamaño dentro del límite máximo:**
   ```typescript
   if (rows > MAX_MATRIX_SIZE || cols > MAX_MATRIX_SIZE)
   ```

3. **Dimensiones coinciden:**
   - `supply.length === rows`
   - `demand.length === cols`

4. **Matriz es rectangular:**
   ```typescript
   for (let i = 0; i < rows; i++) {
     if (!Array.isArray(costs[i]) || costs[i].length !== cols)
   ```

5. **Todos los costos son válidos:**
   - No negativos
   - Finitos
   - Menores que `MAX_NUMERIC_VALUE`

6. **Todas las ofertas son válidas:**
   - No negativas
   - Finitas
   - Menores que `MAX_NUMERIC_VALUE`

7. **Todas las demandas son válidas:**
   - No negativas
   - Finitas
   - Menores que `MAX_NUMERIC_VALUE`

8. **Oferta y demanda totales > 0:**
   ```typescript
   if (totalSupply <= FLOAT_TOLERANCE || totalDemand <= FLOAT_TOLERANCE)
   ```

9. **Problema balanceado (oferta = demanda):**
   ```typescript
   if (Math.abs(totalSupply - totalDemand) > FLOAT_TOLERANCE)
   ```

**Uso:**
Se llama al inicio de cada método para validar antes de intentar resolver.

---

### 6. `pickCheapestCell(costs, remainingSupply, remainingDemand)` (Privada)

```typescript
function pickCheapestCell(
  costs: number[][],
  remainingSupply: number[],
  remainingDemand: number[]
): { row: number; col: number; cost: number } | null { ... }
```

**Parámetros:**
- `costs: number[][]` - matriz de costos.
- `remainingSupply: number[]` - oferta restante de cada origen.
- `remainingDemand: number[]` - demanda restante de cada destino.

**Retorno:**
- Objeto `{ row, col, cost }` con la celda de menor costo, o `null` si no hay celdas disponibles.

**Explicación:**
- Busca la celda con el costo unitario más bajo entre todas las celdas "activas" (con oferta y demanda disponibles).
- Desempates:
  1. Si hay empate en costo, elige la que tiene mayor capacidad (puede asignar más unidades).
  2. Si hay empate en capacidad, elige la que está más arriba-izquierda (fila menor, luego columna menor).

**Ejemplo:**
```typescript
// Si costs = [[10, 20], [15, 8]], remainingSupply = [5, 5], remainingDemand = [3, 7]
// Retorna: { row: 1, col: 1, cost: 8 } (porque 8 es el costo mínimo)
```

**Uso:**
Se usa en el método `minimumCost()` para seleccionar la siguiente celda a llenar.

---

### 7. `buildVogelCandidates(costs, remainingSupply, remainingDemand)` (Privada)

```typescript
function buildVogelCandidates(
  costs: number[][],
  remainingSupply: number[],
  remainingDemand: number[]
): VogelCandidate[] { ... }
```

**Parámetros:**
- Mismos que en `pickCheapestCell`.

**Retorno:**
- Array de `VogelCandidate`: una candidata por cada fila activa + una candidata por cada columna activa.

**Explicación:**
Esta función es compleja. Hace esto para **cada fila activa**:

1. Obtiene las columnas que todavía tienen demanda.
2. Ordena esas columnas por costo (de menor a mayor).
3. Calcula la penalización: `costo_segundo_menor - costo_menor`.
   - Si solo hay una columna activa, la penalización es el costo de esa columna.
4. Guarda un `VogelCandidate` con esa información.

Luego hace lo mismo para **cada columna activa**.

**Ejemplo:**
```typescript
// Fila 0 con columnas activas [0, 1, 2]
// Costos: [5, 8, 10]
// Penalización = 8 - 5 = 3
// Se crea un candidato de tipo 'row' con penalty=3
```

**Uso:**
Se usa en `vogelApproximation()` para obtener todos los candidatos y elegir el de mayor penalización.

---

## Funciones principales exportadas

Estas funciones son la interfaz pública; se importan en `App.tsx` y se llaman cuando el usuario presiona "Resolver Problema".

### 1. `northwestCorner(costs, supply, demand)` (EXPORTADA)

```typescript
export function northwestCorner(
  costs: number[][],
  supply: number[],
  demand: number[]
): TransportResult { ... }
```

**Descripción:**
Implementa el **método de la esquina noroeste**. Comienza en la celda superior izquierda (0,0) y va avanzando hacia abajo-derecha.

**Algoritmo:**
1. Inicializa punteros `i=0` (fila), `j=0` (columna).
2. Mientras haya filas y columnas sin procesar:
   - Si la oferta de fila `i` se agotó, sube a la siguiente.
   - Si la demanda de columna `j` se agotó, sigue a la siguiente.
   - Asigna el mínimo entre `remainingSupply[i]` y `remainingDemand[j]` en la celda `(i, j)`.
   - Guarda un paso con la iteración actual.

**Complejidad:**
- Tiempo: O(m + n) donde m=filas, n=columnas.
- Es el más rápido.

**Cualidades:**
- Siempre termina en m + n - 1 asignaciones.
- Solución inicial a menudo subóptima (no genera buen costo).

**Retorno:**
`TransportResult` con asignaciones, costo total y pasos.

---

### 2. `minimumCost(costs, supply, demand)` (EXPORTADA)

```typescript
export function minimumCost(
  costs: number[][],
  supply: number[],
  demand: number[]
): TransportResult { ... }
```

**Descripción:**
Implementa el **método de costo mínimo**. En cada iteración, busca la celda de menor costo y asigna lo máximo posible.

**Algoritmo:**
1. Mientras haya oferta y demanda sin satisfacer:
   - Llama `pickCheapestCell()` para encontrar la celda de menor costo.
   - Asigna el mínimo entre oferta y demanda en esa celda.
   - Guarda un paso.

**Complejidad:**
- Tiempo: O(m·n·log(m·n)) porque en cada iteración busca el mínimo entre m·n celdas.
- Más lento que Esquina Noroeste pero más rápido que Vogel.

**Cualidades:**
- Solución inicial mejor que Esquina Noroeste (menor costo).
- Intuitivo: siempre elige la ruta más barata disponible.

**Retorno:**
`TransportResult` con asignaciones, costo total y pasos.

---

### 3. `vogelApproximation(costs, supply, demand)` (EXPORTADA)

```typescript
export function vogelApproximation(
  costs: number[][],
  supply: number[],
  demand: number[]
): TransportResult { ... }
```

**Descripción:**
Implementa la **aproximación de Vogel (VAM)**. Es el método más sofisticado: calcula penalizaciones y elige la fila/columna con mayor penalización.

**Algoritmo:**
1. Mientras haya oferta y demanda sin satisfacer:
   - Llama `buildVogelCandidates()` para calcular penalizaciones de todas las filas y columnas.
   - Ordena los candidatos por:
     1. Penalización (mayor primero).
     2. Costo (menor primero).
     3. Capacidad (mayor primero).
     4. Tipo (filas antes que columnas).
     5. Índice (menor primero).
   - Toma el candidato superior.
   - Asigna en la celda de menor costo de esa fila/columna.
   - Guarda un paso.

**Complejidad:**
- Tiempo: O(m·n·log(m·n)) porque calcula penalizaciones en cada iteración.
- Similar a Costo Mínimo, pero con más cálculos internos.

**Cualidades:**
- Solución inicial frecuentemente óptima o muy cercana (el mejor costo de los tres).
- Más lento que los otros dos.
- Muy usado en la práctica.

**Retorno:**
`TransportResult` con asignaciones, costo total y pasos.

---

## Resumen de exportaciones

**Se exportan estos elementos:**

| Elemento | Tipo | Propósito |
|---|---|---|
| `TransportResult` | Interface | Estructura de salida de métodos |
| `TransportValidation` | Interface | Estructura de validación |
| `MAX_MATRIX_SIZE` | Constante | Límite máximo de matriz |
| `METHOD_LIMITS` | Constante | Límites por método |
| `validateTransportProblem()` | Función | Validar problema antes de resolver |
| `northwestCorner()` | Función | Resolver con método NW |
| `minimumCost()` | Función | Resolver con método MC |
| `vogelApproximation()` | Función | Resolver con método Vogel |

**NO se exportan (privados):**
- `buildEmptyAllocations()`
- `cloneAllocations()`
- `isNonNegativeFinite()`
- `normalizeZero()`
- `pickCheapestCell()`
- `buildVogelCandidates()`
- `VogelCandidate` interface

---

## Flujo típico de uso

Desde `App.tsx`:

```typescript
import {
  northwestCorner,
  minimumCost,
  vogelApproximation,
  validateTransportProblem,
  METHOD_LIMITS,
} from './utils/transportAlgorithms';

// El usuario ingresa datos
const costs = [[8, 6], [9, 12]];
const supply = [35, 50];
const demand = [45, 40];

// El usuario selecciona método y presiona "Resolver"
const validation = validateTransportProblem(costs, supply, demand);
if (!validation.isValid) {
  // Mostrar errores
  console.log(validation.errors);
} else {
  // Resolver
  const result = northwestCorner(costs, supply, demand);
  console.log(result.allocations); // [[35, 0], [10, 40]]
  console.log(result.totalCost);   // 1240
  console.log(result.steps);       // array de iteraciones
}
```

---

## Notas importantes

1. **Tolerancia a decimales:** Todos los métodos soportan números decimales (no solo enteros) gracias a `FLOAT_TOLERANCE` y `normalizeZero()`.

2. **Seguridad:** Se valida exhaustivamente antes de resolver. Nunca se intenta resolver un problema inválido.

3. **Registro de pasos:** Todos los métodos guardan cada iteración para poder mostrar el proceso "Paso a Paso" al usuario.

4. **Costo total:** Se calcula acumulativamente en cada iteración: `totalCost += allocation * costs[i][j]`.

5. **Asignaciones:** Solo se guardan números no negativos. Los ceros se mantienen pero no se asignan (significan "no hay transporte entre esos puntos").

