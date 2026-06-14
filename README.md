**Proyecto: Gestión de Proyecto — MUSEOS2.0**

Resumen
- **Descripción:** Aplicación Next.js + TypeScript para gestionar elementos del proyecto (UI, algoritmos de transporte, componentes reutilizables).
- **Ubicación del código:** raíz del repositorio (esta documentación).

**Estructura principal**
- **app/**: Rutas y layout de Next.js. Ej.: [app/layout.tsx](app/layout.tsx), [app/page.tsx](app/page.tsx)
- **components/**: Componentes de alto nivel de la app.
  - [components/Footer.tsx](components/Footer.tsx) — pie de página global.
  - [components/theme-provider.tsx](components/theme-provider.tsx) — proveedor de tema (dark/light) y contexto.
  - [components/transporte/](components/transporte/) — funcionalidad específica de transporte y UI asociada:
    - [components/transporte/index.ts](components/transporte/index.ts) — punto de exportación para subcomponentes.
    - [components/transporte/ModalAyuda.tsx](components/transporte/ModalAyuda.tsx) — modal de ayuda.
    - [components/transporte/PanelComparacion.tsx](components/transporte/PanelComparacion.tsx) — compara resultados.
    - [components/transporte/PanelHistorial.tsx](components/transporte/PanelHistorial.tsx) — historial de ejecuciones.
    - [components/transporte/PanelPasos.tsx](components/transporte/PanelPasos.tsx) — muestra pasos del algoritmo.
    - [components/transporte/SelectorMatriz.tsx](components/transporte/SelectorMatriz.tsx) — selector/entrada de matrices.
    - [components/transporte/SelectorMetodo.tsx](components/transporte/SelectorMetodo.tsx) — selector de método/algoritmo.
    - [components/transporte/TablaCostos.tsx](components/transporte/TablaCostos.tsx) — visualiza matriz de costos/resultados.
- **ui/**: Biblioteca de componentes reutilizables (botones, inputs, dialogs, tablas, etc.). Cada archivo exporta componentes estilizados y controlados, por ejemplo [ui/button.tsx](ui/button.tsx), [ui/table.tsx](ui/table.tsx).
- **hooks/**: Hooks personalizados reutilizables.
  - [hooks/use-mobile.ts](hooks/use-mobile.ts) — detecta dispositivo móvil.
  - [hooks/use-toast.ts](hooks/use-toast.ts) — sistema de notificaciones (toast).
- **lib/**: Lógica no visual y utilidades.
  - [lib/algoritmos-transporte.ts](lib/algoritmos-transporte.ts) — implementación de algoritmos de transporte (punto clave para cambios en la lógica).
  - [lib/utils.ts](lib/utils.ts) — utilidades auxiliares usadas por componentes y algoritmos.
- **public/**: Archivos estáticos (imágenes, fuentes, etc.).

**Cómo está organizado el código (dónde está cada función importante)**
- Lógica de negocio (algoritmos): en `lib/algoritmos-transporte.ts`. Busca funciones exportadas como `solveXxx`, `calcular...` o similares. Modifica aquí si quieres cambiar cálculos o añadir nuevos métodos.
- Helpers/Formatos: en `lib/utils.ts`. Funciones pequeñas (formateo, transformaciones) suelen estar aquí.
- Integración UI → lógica: los componentes dentro de `components/transporte/` construyen la interfaz para introducir datos y mostrar resultados. Estos componentes llaman a las funciones de `lib/algoritmos-transporte.ts`.
- Estado y hooks: revisa `hooks/` y `components/theme-provider.tsx` para ver cómo se maneja estado compartido y temas.
- Componentes reutilizables: `ui/` contiene componentes atómicos; su API suele ser `export function Button(props)` o `export const Input = (...)`. Cambia estilos o props aquí.

**Directrices para modificar métodos y lógica**
1. Localiza la función:
   - Los algoritmos y cálculos están en [lib/algoritmos-transporte.ts](lib/algoritmos-transporte.ts).
   - Busca `export` o `export default` dentro del archivo para identificar funciones públicas.
2. Prueba los cambios localmente:
   - Corre la app en modo desarrollo: `pnpm install` (si falta) y `pnpm dev`.
3. Mantén las firmas públicas estables:
   - Si cambias parámetros de una función exportada, actualiza también las llamadas en `components/transporte/*`.
4. Añade tests simples (opcional): crear un archivo de test para la función modificada si tienes configuración de testing.

**Ejemplos de edición rápida**
- Cambiar la lógica de cálculo: editar [lib/algoritmos-transporte.ts](lib/algoritmos-transporte.ts) en la función principal (ej.: `calcularTransporte()`) y guardar.
- Ajustar cómo se muestran pasos: editar [components/transporte/PanelPasos.tsx](components/transporte/PanelPasos.tsx) — modifica el render de la lista de pasos.
- Añadir una nueva opción de método: 1) implementar la función matemática en `lib/algoritmos-transporte.ts`; 2) exponerla en `components/transporte/SelectorMetodo.tsx` añadiendo la opción y su handler; 3) actualizar `PanelComparacion` si quieres mostrarla.

**Convenciones y notas**
- TypeScript: los tipos viven junto al código; revisa las declaraciones en `global.d.ts` y `next-env.d.ts` si hay tipos globales.
- Estilo: sigue el patrón de componentes en `ui/` (props controladas, reuso). Mantén separación entre UI (components) y lógica (lib).
- Rutas Next.js: la carpeta `app/` contiene rutas y layout; las páginas importan componentes desde `components/`.

**Comandos útiles**
- Instalar dependencias: `pnpm install`
- Ejecutar desarrollo: `pnpm dev`
- Construir: `pnpm build`
- Ejecutar producción localmente: `pnpm start`

¿Qué puedo hacer después?
- Puedo generar documentación más detallada por archivo (lista de funciones y firmas) si quieres que analice cada archivo y extraiga las funciones exportadas.
- También puedo añadir ejemplos de llamadas y pruebas unitarias para los métodos clave.

---
Si quieres que haga un inventario función por función (exportadas y ubicación exacta), dime y lo genero archivo a archivo.
