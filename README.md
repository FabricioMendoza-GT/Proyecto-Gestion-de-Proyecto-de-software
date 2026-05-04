
  # Dashboard de Cálculo de Transporte

  Aplicación web para resolver el Problema de Transporte con tres métodos de solución inicial:

  - Esquina Noroeste
  - Costo Mínimo
  - Aproximación de Vogel (VAM)

  La interfaz permite ingresar costos, oferta y demanda, resolver en modo paso a paso o comparación y visualizar resultados.

  ## Dónde se aplican los métodos en el código

  Toda la lógica algorítmica está centralizada en:

  - `src/app/utils/transportAlgorithms.ts`

  Implementaciones:

  - Método de la esquina noroeste: función `northwestCorner(costs, supply, demand)`
  - Método de costo mínimo: función `minimumCost(costs, supply, demand)`
  - Método de aproximación de Vogel: función `vogelApproximation(costs, supply, demand)`

  Funciones de apoyo relevantes:

  - Validación global del problema: `validateTransportProblem(...)`
  - Selección de celda más barata (Costo Mínimo): `pickCheapestCell(...)`
  - Candidatos y penalizaciones (Vogel): `buildVogelCandidates(...)`

  Integración con la UI:

  - Selección de método y modo de solución: `src/app/components/MethodSelector.tsx`
  - Ejecución del método seleccionado y manejo de resultados: `src/app/App.tsx` (función `solve`)
  - Visualización de resultados agregados: `src/app/components/ResultsCard.tsx`
  - Comparación entre métodos: `src/app/components/ComparisonPanel.tsx`
  - Visualización paso a paso de iteraciones: `src/app/components/StepByStepPanel.tsx`

  ## Trazabilidad de requisitos (imagen)

  ### Requisitos funcionales

  #### RF01 - Usabilidad
  El sistema debe permitir al usuario ingresar datos mediante una interfaz gráfica intuitiva.

  Cumplimiento:

  - Tabla editable para costos/oferta/demanda con controles visuales: `src/app/components/TransportTable.tsx`
  - Selector de tamaño de matriz y controles de agregar/eliminar filas/columnas: `src/app/components/MatrixSelector.tsx` y `src/app/components/TransportTable.tsx`
  - Modal de ayuda de uso guiado: `src/app/components/HelpModal.tsx`

  #### RF02 - Validación
  El sistema debe validar que los datos ingresados cumplan las condiciones del problema.

  Cumplimiento:

  - Validaciones estructurales y numéricas: `validateTransportProblem(...)` en `src/app/utils/transportAlgorithms.ts`
  - Reglas cubiertas: matriz rectangular, tamaños, no negativos, valores finitos, límite máximo numérico, balance oferta=demanda, totales > 0.
  - Despliegue de errores de validación al usuario: bloque `validationErrors` en `src/app/App.tsx`

  #### RF03 - Procesamiento
  El usuario podrá elegir qué método usar (esquina noroeste, costo mínimo, vogel).

  Cumplimiento:

  - Selección explícita de método en la UI: `src/app/components/MethodSelector.tsx`
  - Ejecución por `switch` del método elegido: función `solve` en `src/app/App.tsx`
  - Implementación de los 3 métodos: `src/app/utils/transportAlgorithms.ts`

  #### RF04 - Retroalimentación
  Mostrará mensajes si hay errores en los datos.

  Cumplimiento:

  - Errores detallados en pantalla (lista visible): `src/app/App.tsx` (`validationErrors`)
  - Indicador visual de balanceado/no balanceado en tiempo real: `src/app/components/TransportTable.tsx`

  #### RF05 - Validación
  El sistema debe validar el tamaño de las matrices (ofertas, demandas y matriz de costos).

  Cumplimiento:

  - Límite de tamaño centralizado con `MAX_MATRIX_SIZE` en `src/app/utils/transportAlgorithms.ts`
  - Bloqueo de crecimiento por UI al superar límite (orígenes/destinos): `handleAddRow` / `handleAddColumn` en `src/app/App.tsx`
  - Verificación de dimensiones compatibles en `validateTransportProblem(...)`.

  #### RF05 - Usabilidad
  El sistema debe poder manipular el tamaño de matrices de forma más dinámica.

  Cumplimiento:

  - Botones para añadir/quitar orígenes y destinos en `src/app/components/TransportTable.tsx`
  - Selección rápida de dimensiones base en `src/app/components/MatrixSelector.tsx`
  - Reinicio de estado de solución al cambiar dimensiones en `handleMatrixSelect` de `src/app/App.tsx`

  #### RF06 - Validación
  Permitir cambios o advertencias cuando se ubican valores negativos no permitidos.

  Cumplimiento:

  - Inputs numéricos con mínimo 0 (`min="0"`) en `src/app/components/TransportTable.tsx`
  - Sanitización de entradas para no permitir negativos en `sanitizeNumber` de `src/app/App.tsx`
  - Validación defensiva adicional con mensajes por celda/origen/destino en `validateTransportProblem(...)`.

  ### Requisitos no funcionales

  #### RNF01 - Usabilidad
  Sistema fácil de usar incluso para personas con poco conocimiento.

  Cumplimiento:

  - Flujo guiado con secciones claras: configuración, tabla, método, resultados (`src/app/App.tsx`)
  - Guía de uso con explicación de pasos y métodos (`src/app/components/HelpModal.tsx`)

  #### RNF02 - Usabilidad
  Interfaz clara y ordenada, especialmente para mostrar la tabla.

  Cumplimiento:

  - Diseño de tabla con encabezados O/D, colores por tipo de dato y resaltado de celdas activas (`src/app/components/TransportTable.tsx`)
  - Tarjetas de resumen de resultados (`src/app/components/ResultsCard.tsx`)

  #### RNF03 - Rendimiento
  Respuesta rápida al ejecutar cálculos.

  Cumplimiento:

  - Cálculo en memoria con estructuras simples (arreglos), sin llamadas de red: `src/app/utils/transportAlgorithms.ts`
  - Complejidad adecuada para tamaños acotados por `MAX_MATRIX_SIZE`.

  #### RNF04 - Seguridad
  Evitar errores (datos negativos o incorrectos).

  Cumplimiento:

  - Validación estricta de entradas y bloqueo de casos inválidos antes de resolver (`validateTransportProblem(...)`)
  - Manejo de excepciones en resolución (`try/catch`) en `solve` de `src/app/App.tsx`.

  #### RNF05 - Seguridad
  Control/restricción de ciertas funciones según usuario.

  Estado actual:

  - No implementado control por roles/usuarios (la app es local y de un solo usuario).
  - Restricción parcial existente: límites de tamaño, validaciones de entrada y tope de historial local (`slice(0, 20)` en `saveToHistory` de `src/app/App.tsx`).

  #### RNF06 - Rendimiento
  Tiempos de carga adecuados y eficiencia ante cambios de tamaño.

  Cumplimiento:

  - Aplicación cliente con Vite (arranque rápido en desarrollo y build optimizado).
  - Re-render controlado por estado local y operaciones de matriz pequeñas por límite de tamaño.

  ## Instalación de dependencias

  Ya se realizó instalación local con:

  ```bash
  npm install
  ```

  ## Ejecución local

  1. Instalar dependencias (si aún no están instaladas):

  ```bash
  npm install
  ```

  2. Ejecutar en modo desarrollo:

  ```bash
  npm run dev
  ```

  3. Abrir la URL mostrada por Vite en la terminal (normalmente `http://localhost:5173`).

  ## Build de producción

  ```bash
  npm run build
  ```

  Este comando ya fue validado correctamente en local.
  