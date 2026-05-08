# Resumen del proyecto

Este proyecto es una aplicación web para resolver el Problema de Transporte. Permite ingresar costos, ofertas y demandas, elegir un método de solución y ver el resultado de forma clara.

## ¿Qué hace la aplicación?

La app ayuda a construir una solución inicial para un problema de transporte usando tres métodos clásicos:

- Esquina Noroeste
- Costo Mínimo
- Aproximación de Vogel

Además, la aplicación puede mostrar el proceso paso a paso o comparar los tres métodos para ver cuál produce el menor costo total.

## Flujo general de uso

1. El usuario elige el tamaño de la matriz con la que va a trabajar.
2. Ingresa la matriz de costos, la oferta de cada origen y la demanda de cada destino.
3. Selecciona el método de solución.
4. Ejecuta el cálculo.
5. La app muestra el resultado, las iteraciones o la comparación entre métodos.

## Estructura principal del proyecto

El proyecto está organizado así:

- `src/main.tsx`: punto de entrada de React.
- `src/app/App.tsx`: componente principal de toda la aplicación.
- `src/app/utils/transportAlgorithms.ts`: lógica de los algoritmos y validaciones.
- `src/app/components/`: componentes visuales de la interfaz.
- `src/app/components/TransportTable.tsx`: tabla editable de costos, oferta y demanda.
- `src/app/components/MatrixSelector.tsx`: selección rápida del tamaño inicial.
- `src/app/components/MethodSelector.tsx`: selección del método y del modo de solución.
- `src/app/components/StepByStepPanel.tsx`: panel con iteraciones paso a paso.
- `src/app/components/ComparisonPanel.tsx`: panel para comparar resultados.
- `src/app/components/HistoryPanel.tsx`: historial local de cálculos.
- `src/app/components/HelpModal.tsx`: ventana de ayuda para el usuario.

## Lógica de cálculo

Toda la parte matemática está centralizada en `src/app/utils/transportAlgorithms.ts`.

### 1. Esquina Noroeste

Este método empieza en la celda superior izquierda de la tabla y va asignando unidades moviéndose hacia la derecha o hacia abajo según se agote la oferta o la demanda.

### 2. Costo Mínimo

Este método busca siempre la celda con el menor costo disponible y asigna la mayor cantidad posible sin romper las restricciones de oferta y demanda.

### 3. Aproximación de Vogel

Este método calcula penalizaciones por filas y columnas para elegir la opción más conveniente en cada paso. Normalmente da soluciones iniciales de mejor calidad que los otros dos métodos simples.

## Validaciones que realiza

La aplicación no resuelve cualquier dato sin revisar primero si el problema es válido. Verifica, entre otras cosas:

- que la matriz de costos exista y tenga forma rectangular,
- que las ofertas y demandas coincidan con la cantidad de filas y columnas,
- que los valores sean numéricos, finitos y no negativos,
- que el problema esté balanceado,
- que no se excedan límites de tamaño definidos por la aplicación.

Si algo está mal, la app muestra errores en pantalla para que el usuario lo corrija.

## Interfaz y comportamiento

La interfaz está pensada para que el usuario vea todo el flujo de forma ordenada:

- arriba aparece el encabezado general,
- en el centro se configura y edita la tabla,
- a la derecha se selecciona el método y el modo de solución,
- debajo aparecen los paneles de iteración o comparación cuando corresponda.

También hay funciones de ayuda, reinicio, exportación y historial local de resultados.

## Datos y persistencia

La aplicación guarda el historial de soluciones en el navegador usando almacenamiento local. Eso permite revisar cálculos anteriores sin depender de un servidor.

## Tecnologías usadas

- React
- TypeScript
- Vite
- Tailwind CSS o clases utilitarias similares
- Iconos de Lucide React

## Cómo ejecutar el proyecto

1. Instalar dependencias:

```bash
npm install
```

2. Levantar el entorno local:

```bash
npm run dev
```

3. Abrir la dirección que muestra Vite en la terminal, normalmente `http://localhost:5173`.

## Build de producción

Para generar la versión optimizada:

```bash
npm run build
```

## Idea principal del proyecto

El objetivo no es solo calcular una respuesta, sino también ayudar a entender cómo se construye una solución inicial para un problema de transporte, comparando métodos y mostrando el proceso de forma visual.