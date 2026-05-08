# Análisis de Estructuras de Control en los Métodos

Este documento detalla los tipos y cantidad de condiciones y bucles utilizados en los tres métodos de resolución del problema de transporte.

---

## 1. Método de la Esquina Noroeste (`northwestCorner`)

### Bucles utilizados:
- **1x `while`** principal: `while (i < rows && j < cols)`
  - Itera mientras haya filas y columnas sin procesar
  - Se ejecuta como máximo `rows + cols - 1` veces (propiedad de soluciones básicas)

### Condiciones utilizadas:
- **5x `if`** simples (sin else):
  1. `if (!validation.isValid)` → lanza error
  2. `if (remainingSupply[i] <= FLOAT_TOLERANCE)` → incrementa fila
  3. `if (remainingDemand[j] <= FLOAT_TOLERANCE)` → incrementa columna
  4. `if (remainingSupply[i] <= FLOAT_TOLERANCE)` → incrementa fila (al final)
  5. `if (remainingDemand[j] <= FLOAT_TOLERANCE)` → incrementa columna (al final)

### Estructura de control general:
```
while (condición compuesta) {
  if → continue
  if → continue
  [asignación]
  if → incremento
  if → incremento
}
``` 

**Total: 1 bucle while + 5 condicionales if**


## 2. Método de Costo Mínimo (`minimumCost`)

### Bucles utilizados:
- **1x `while`** principal: `while (remainingSupply.some(...) && remainingDemand.some(...))`
  - Itera mientras haya oferta y demanda disponibles
  - Dentro de la condición: **2x `.some()`** (métodos iterativos funcionales)

### Condiciones utilizadas:
- **2x `if`** simples (sin else):
  1. `if (!validation.isValid)` → lanza error
  2. `if (!bestCell)` → rompe el bucle

### Funciones auxiliares llamadas:
- `pickCheapestCell()` → busca la celda de menor costo (internamente usa 2 bucles for anidados)

### Estructura de control general:
```
while (condición con .some() x2) {
  if → break
  [asignación]
}
```

**Total: 1 bucle while + 2 condicionales if + 2 métodos .some()**

---

## 3. Método de Aproximación de Vogel (`vogelApproximation`)

### Bucles utilizados:
- **1x `while`** principal: `while (remainingSupply.some(...) && remainingDemand.some(...))`
  - Itera mientras haya oferta y demanda disponibles
  - Dentro de la condición: **2x `.some()`** (métodos iterativos funcionales)

- **1x `.sort()`** con comparador: `candidates.sort((a, b) => { ... })`
  - Ordena candidatos por penalización (descendente), costo (ascendente), capacidad y posición

### Funciones auxiliares llamadas:
- `buildVogelCandidates()` → construye lista de candidatos (usa múltiples bucles internos):
  - **2x `for`** loops: `for (let i = 0; i < rows; i++)` y `for (let j = 0; j < cols; j++)`
  - **4x `.filter()`**: para filas/columnas activas (métodos iterativos funcionales)
  - **4x `.map()`**: para transformar datos (métodos iterativos funcionales)
  - **4x `.sort()`**: dentro de los mapeos, ordena costos

### Condiciones utilizadas en `vogelApproximation`:
- **2x `if`** simples (sin else):
  1. `if (!validation.isValid)` → lanza error
  2. `if (candidates.length === 0)` → rompe el bucle

### Condiciones dentro de `buildVogelCandidates`:
- **4x `if`** simples (sin else):
  1. `if (remainingSupply[i] <= 0)` → continue (en primer for)
  2. `if (activeCols.length === 0)` → continue (en primer for)
  3. `if (remainingDemand[j] <= 0)` → continue (en segundo for)
  4. `if (activeRows.length === 0)` → continue (en segundo for)

### Condiciones dentro del `.sort()` comparador:
- **4x operadores ternarios** (condicionales implícitos en return):
  1. `if (b.penalty !== a.penalty)` → return b.penalty - a.penalty
  2. `if (a.minCost !== b.minCost)` → return a.minCost - b.minCost
  3. `if (b.targetCapacity !== a.targetCapacity)` → return b.targetCapacity - a.targetCapacity
  4. `if (a.type !== b.type)` → return a.type === 'row' ? -1 : 1

### Estructura de control general:
```
while (condición con .some() x2) {
  if → break
  candidatos = buildVogelCandidates() {
    for i {
      if → continue
      if → continue
      .filter() + .map() + .sort()
    }
    for j {
      if → continue
      if → continue
      .filter() + .map() + .sort()
    }
  }
  .sort() con 4 ternarios
  [asignación]
}
```

**Total en vogelApproximation: 1 while + 2 if + 2 .some()**

**Total en buildVogelCandidates: 2 for + 4 if + 4 .filter() + 4 .map() + 4 .sort()**

---

## Resumen Comparativo

| Estructura | Esquina Noroeste | Costo Mínimo | Vogel |
|---|---|---|---|
| **Bucles `while`** | 1 | 1 | 1 |
| **Bucles `for`** | 0 (dentro de helpers) | 0 (dentro de helpers) | 2 (en buildVogelCandidates) |
| **`.some()`** | 0 | 2 | 2 |
| **`.filter()`** | 0 | 0 | 4 |
| **`.map()`** | 0 | 0 | 4 |
| **`.sort()`** | 0 | 0 | 5 (1 principal + 4 en helpers) |
| **Condicionales `if`** | 5 | 2 | 6 (2 principales + 4 en helpers) |
| **Ternarios (en comparadores)** | 0 | 0 | 4 |
| **Total de estructuras** | **6** | **4** | **29** |

---

## Clasificación por tipo

### Bucles

**Bucles secuenciales:**
- `while`: avanza iteración a iteración según condición, sin acceso directo a índice (aunque Esquina Noroeste lo usa)

**Bucles iterativos funcionales:**
- `.some()`: evalúa si al menos un elemento cumple condición
- `.filter()`: crea nueva lista con elementos que cumplen condición
- `.map()`: transforma cada elemento
- `.sort()`: ordena según comparador

**Bucles tradicionales:**
- `for (let i = 0; i < n; i++)`: acceso directo a índice, rango conocido

### Condiciones

**Condicionales simples (`if`):**
- Evalúan una o varias expresiones booleanas
- Usadas principalmente para validación y control de flujo

**Operadores ternarios:**
- Forma compacta de `if/else` usada en comparadores de `.sort()`
- `condición ? valorTrue : valorFalse`

---

## Observaciones

1. **Esquina Noroeste** es la más simple: solo while + ifs directos, complejidad O(m + n)
2. **Costo Mínimo** añade búsqueda de mínimo: while + algunos .some(), complejidad O(m·n·(m·n))
3. **Vogel** es la más compleja: while + bucles for + múltiples filtros/mapas/sorts, complejidad O(m·n·log(m·n))

La complejidad aumenta porque Vogel necesita evaluar penalizaciones de todas las filas y columnas en cada iteración.

