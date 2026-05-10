/**
 * =====================================================================
 * ÍNDICE DE COMPONENTES DE TRANSPORTE
 * 
 * Exporta todos los componentes relacionados con el problema de transporte.
 * Importe desde aquí para mantener el código organizado.
 * 
 * Ejemplo de uso:
 * import { TablaCostos, SelectorMetodo } from '@/components/transporte';
 * =====================================================================
 */

// Tabla principal para ingresar costos, ofertas y demandas
export { TablaCostos } from './TablaCostos';

// Selector de método de resolución y modo de visualización
export { SelectorMetodo } from './SelectorMetodo';
export type { MetodoTransporte, ModoSolucion } from './SelectorMetodo';

// Panel de visualización paso a paso
export { PanelPasos } from './PanelPasos';

// Panel de comparación de métodos
export { PanelComparacion } from './PanelComparacion';

// Panel de historial de ejercicios
export { PanelHistorial } from './PanelHistorial';
export type { EntradaHistorial } from './PanelHistorial';

// Selector rápido de tamaño de matriz
export { SelectorMatriz } from './SelectorMatriz';

// Modal de ayuda con información de uso
export { ModalAyuda } from './ModalAyuda';
