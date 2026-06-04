/**
 * =====================================================================
 * PÁGINA PRINCIPAL - MÉTODOS DE TRANSPORTE
 * Universidad Laica Eloy Alfaro de Manabí (ULEAM)
 * 
 * Esta página contiene la aplicación completa para resolver problemas
 * de transporte mediante los métodos de:
 * - Esquina Noroeste
 * - Costo Mínimo
 * - Aproximación de Vogel (VAM)
 * 
 * ESTRUCTURA DEL CÓDIGO:
 * 1. Estados y configuración inicial
 * 2. Funciones de manejo de datos
 * 3. Función de resolución
 * 4. Renderizado de la interfaz
 * 
 * CÓMO MODIFICAR:
 * - Datos iniciales: busque los useState con valores por defecto
 * - Límites de historial: busque .slice(0, 20)
 * - Textos y etiquetas: están en español en el JSX
 * =====================================================================
 */
'use client';

import { useState, useEffect } from 'react';
import { Calculator, Download, RotateCcw, HelpCircle, History as HistoryIcon } from 'lucide-react';

// Componentes de la aplicación
import {
  TablaCostos,
  SelectorMetodo,
  PanelPasos,
  PanelComparacion,
  PanelHistorial,
  SelectorMatriz,
  ModalAyuda,
  BotonesExportarImportar,
} from '@/components/transporte';
import type { MetodoTransporte, ModoSolucion, EntradaHistorial } from '@/components/transporte';
import type { Paso } from '@/lib/algoritmos-transporte';

// Algoritmos de transporte
import {
  esquinaNoroeste,
  costoMinimo,
  aproximacionVogel,
  validarProblemaTransporte,
  LIMITES_METODO,
} from '@/lib/algoritmos-transporte';

// Funciones de gestión de matrices
import { exportarResultadosPDF } from '@/lib/gestionMatrices';

// Componentes UI de shadcn
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

/* =====================================================================
   COMPONENTE PRINCIPAL
   ===================================================================== */
export default function PaginaPrincipal() {
  /* ===================================================================
     ESTADOS DE LA APLICACIÓN
     =================================================================== */
  
  // Datos del problema (matriz de costos, ofertas, demandas)
  // NOTA: Estos son los valores iniciales de ejemplo
  const [costos, setCostos] = useState<number[][]>([
    [8, 6, 10, 9],
    [9, 12, 13, 7],
    [14, 9, 16, 5],
  ]);
  const [oferta, setOferta] = useState<number[]>([35, 50, 40]);
  const [demanda, setDemanda] = useState<number[]>([45, 20, 30, 30]);

  // Método y modo de visualización seleccionados
  const [metodoSeleccionado, setMetodoSeleccionado] = useState<MetodoTransporte>('noroeste');
  const [modoSeleccionado, setModoSeleccionado] = useState<ModoSolucion>('paso-a-paso');

  // Estado de la solución
  const [pasoActual, setPasoActual] = useState(0);
  const [pasos, setPasos] = useState<Paso[]>([]);
  const [asignaciones, setAsignaciones] = useState<number[][]>([]);
  const [costoTotal, setCostoTotal] = useState<number>(0);
  const [resultadosComparacion, setResultadosComparacion] = useState<{metodo: string; costo: number; asignaciones: number[][]}[]>([]);

  // UI: modales y paneles
  const [mostrarAyuda, setMostrarAyuda] = useState(false);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [historial, setHistorial] = useState<EntradaHistorial[]>([]);
  const [erroresValidacion, setErroresValidacion] = useState<string[]>([]);
  const [mostrarModalValidacion, setMostrarModalValidacion] = useState(false);

  /* ===================================================================
     FUNCIONES AUXILIARES
     =================================================================== */

  /**
   * Limita un número a un rango válido (no negativo, máximo 1M)
   */
  const sanitizarNumero = (valor: number) => {
    if (!Number.isFinite(valor)) return 0;
    return Math.max(0, Math.min(1_000_000, valor));
  };

  /**
   * Obtiene los límites de matriz según el método seleccionado
   */
  const obtenerLimitesMetodo = () => {
    const limitesSeleccionados = (() => {
      switch (metodoSeleccionado) {
        case 'noroeste':
          return LIMITES_METODO.noroeste;
        case 'costo-minimo':
          return LIMITES_METODO.costoMinimo;
        case 'vogel':
          return LIMITES_METODO.vogel;
        default:
          return LIMITES_METODO.noroeste;
      }
    })();

    // En modo comparación, usar el mínimo de todos los métodos
    if (modoSeleccionado === 'comparacion') {
      return {
        maxFilas: Math.min(limitesSeleccionados.maxFilas, LIMITES_METODO.vogel.maxFilas),
        maxColumnas: Math.min(limitesSeleccionados.maxColumnas, LIMITES_METODO.vogel.maxColumnas),
      };
    }

    return limitesSeleccionados;
  };

  const limitesMetodo = obtenerLimitesMetodo();

  /**
   * Obtiene el nombre legible del método actual
   */
  const obtenerNombreMetodo = () => {
    switch (metodoSeleccionado) {
      case 'noroeste': return 'Esquina Noroeste';
      case 'costo-minimo': return 'Costo Mínimo';
      case 'vogel': return 'Aproximación de Vogel';
      default: return '';
    }
  };

  /* ===================================================================
     EFECTOS
     =================================================================== */

  // Mostrar modal de validación temporalmente (4 segundos)
  useEffect(() => {
    if (erroresValidacion.length === 0) {
      setMostrarModalValidacion(false);
      return;
    }

    setMostrarModalValidacion(true);
    const timeoutId = window.setTimeout(() => {
      setMostrarModalValidacion(false);
      setErroresValidacion([]);
    }, 4000);

    return () => window.clearTimeout(timeoutId);
  }, [erroresValidacion]);

  // Cargar historial desde localStorage al iniciar
  useEffect(() => {
    const historialGuardado = localStorage.getItem('historialTransporte');
    if (historialGuardado) {
      setHistorial(JSON.parse(historialGuardado).map((entrada: EntradaHistorial) => ({
        ...entrada,
        fecha: new Date(entrada.fecha)
      })));
    }
  }, []);

  /* ===================================================================
     MANEJADORES DE EVENTOS
     =================================================================== */

  /**
   * Guarda la solución actual en el historial
   */
  const guardarEnHistorial = (nombreMetodo: string, modo: string, costo: number, asigs: number[][]) => {
    const entrada: EntradaHistorial = {
      id: Date.now().toString(),
      fecha: new Date(),
      metodo: nombreMetodo,
      modo: modo,
      costoTotal: costo,
      dimensiones: `${costos.length}×${costos[0].length}`,
      costos: costos,
      oferta: oferta,
      demanda: demanda,
      asignaciones: asigs,
    };
    // Mantener solo los últimos 20 registros
    const nuevoHistorial = [entrada, ...historial].slice(0, 20);
    setHistorial(nuevoHistorial);
    localStorage.setItem('historialTransporte', JSON.stringify(nuevoHistorial));
  };

  /**
   * Maneja el cambio de un costo en la matriz
   */
  const manejarCambioCosto = (fila: number, columna: number, valor: string) => {
    // No permitir valores negativos
    if (valor.trim().startsWith('-')) {
      setErroresValidacion(['No se permiten números negativos.']);
      return;
    }

    const nuevosCostos = [...costos];
    nuevosCostos[fila][columna] = sanitizarNumero(Number(valor));
    setCostos(nuevosCostos);
    setErroresValidacion([]);
  };

  /**
   * Maneja el cambio de una oferta
   */
  const manejarCambioOferta = (indice: number, valor: string) => {
    if (valor.trim().startsWith('-')) {
      setErroresValidacion(['No se permiten números negativos.']);
      return;
    }

    const nuevaOferta = [...oferta];
    nuevaOferta[indice] = sanitizarNumero(Number(valor));
    setOferta(nuevaOferta);
    setErroresValidacion([]);
  };

  /**
   * Maneja el cambio de una demanda
   */
  const manejarCambioDemanda = (indice: number, valor: string) => {
    if (valor.trim().startsWith('-')) {
      setErroresValidacion(['No se permiten números negativos.']);
      return;
    }

    const nuevaDemanda = [...demanda];
    nuevaDemanda[indice] = sanitizarNumero(Number(valor));
    setDemanda(nuevaDemanda);
    setErroresValidacion([]);
  };

  /**
   * Agrega una nueva fila (origen) a la matriz
   */
  const manejarAgregarFila = () => {
    if (costos.length >= limitesMetodo.maxFilas) {
      setErroresValidacion([`Para ${obtenerNombreMetodo()} el máximo recomendado es ${limitesMetodo.maxFilas} orígenes.`]);
      return;
    }
    setCostos([...costos, Array(costos[0].length).fill(0)]);
    setOferta([...oferta, 0]);
    setErroresValidacion([]);
  };

  /**
   * Agrega una nueva columna (destino) a la matriz
   */
  const manejarAgregarColumna = () => {
    if (costos[0].length >= limitesMetodo.maxColumnas) {
      setErroresValidacion([`Para ${obtenerNombreMetodo()} el máximo recomendado es ${limitesMetodo.maxColumnas} destinos.`]);
      return;
    }
    setCostos(costos.map(fila => [...fila, 0]));
    setDemanda([...demanda, 0]);
    setErroresValidacion([]);
  };

  /**
   * Elimina una fila de la matriz
   */
  const manejarEliminarFila = (indice: number) => {
    if (costos.length > 1) {
      setCostos(costos.filter((_, i) => i !== indice));
      setOferta(oferta.filter((_, i) => i !== indice));
      setErroresValidacion([]);
    }
  };

  /**
   * Elimina una columna de la matriz
   */
  const manejarEliminarColumna = (indice: number) => {
    if (costos[0].length > 1) {
      setCostos(costos.map(fila => fila.filter((_, i) => i !== indice)));
      setDemanda(demanda.filter((_, i) => i !== indice));
      setErroresValidacion([]);
    }
  };

  /**
   * Limpia todos los valores de la matriz (mantiene el tamaño)
   */
  const manejarLimpiarDatos = () => {
    setCostos(costos.map(fila => fila.map(() => 0)));
    setOferta(oferta.map(() => 0));
    setDemanda(demanda.map(() => 0));
    setPasos([]);
    setAsignaciones([]);
    setCostoTotal(0);
    setPasoActual(0);
    setResultadosComparacion([]);
    setErroresValidacion([]);
  };

  /**
   * Selecciona un tamaño de matriz predefinido
   */
  const manejarSeleccionMatriz = (filas: number, columnas: number) => {
    if (filas > limitesMetodo.maxFilas || columnas > limitesMetodo.maxColumnas) {
      setErroresValidacion([
        `La matriz seleccionada supera el límite recomendado para ${obtenerNombreMetodo()}: ${limitesMetodo.maxFilas}×${limitesMetodo.maxColumnas}.`,
      ]);
      return;
    }
    setCostos(Array(filas).fill(0).map(() => Array(columnas).fill(0)));
    setOferta(Array(filas).fill(0));
    setDemanda(Array(columnas).fill(0));
    setPasos([]);
    setAsignaciones([]);
    setCostoTotal(0);
    setPasoActual(0);
    setResultadosComparacion([]);
    setErroresValidacion([]);
  };

  /**
   * Carga una entrada del historial
   */
  const cargarEntradaHistorial = (entrada: EntradaHistorial) => {
    setCostos(entrada.costos);
    setOferta(entrada.oferta);
    setDemanda(entrada.demanda);
    setAsignaciones(entrada.asignaciones);
    setCostoTotal(entrada.costoTotal);
    setPasos([]);
    setResultadosComparacion([]);
    setMostrarHistorial(false);
  };

  /**
   * Importa nuevas matrices desde un archivo
   */
  const manejarImportarMatrices = (costosNuevos: number[][], ofertaNueva: number[], demandaNueva: number[]) => {
    // Validar que las nuevas matrices no superen los límites
    if (costosNuevos.length > limitesMetodo.maxFilas || costosNuevos[0].length > limitesMetodo.maxColumnas) {
      setErroresValidacion([
        `Las matrices importadas superan el límite recomendado para ${obtenerNombreMetodo()}: ${limitesMetodo.maxFilas}×${limitesMetodo.maxColumnas}.`,
      ]);
      return;
    }

    // Actualizar los datos
    setCostos(costosNuevos);
    setOferta(ofertaNueva);
    setDemanda(demandaNueva);

    // Limpiar resultados anteriores
    setPasos([]);
    setAsignaciones([]);
    setCostoTotal(0);
    setPasoActual(0);
    setResultadosComparacion([]);
    setErroresValidacion([]);
  };

  /**
   * Reinicia la aplicación a los valores iniciales de ejemplo
   */
  const reiniciar = () => {
    setCostos([
      [8, 6, 10, 9],
      [9, 12, 13, 7],
      [14, 9, 16, 5],
    ]);
    setOferta([35, 50, 40]);
    setDemanda([45, 20, 30, 30]);
    setPasos([]);
    setAsignaciones([]);
    setCostoTotal(0);
    setPasoActual(0);
    setResultadosComparacion([]);
    setErroresValidacion([]);
  };

  /**
   * Exporta los resultados actuales a un archivo PDF
   */
  const exportarResultados = async () => {
    try {
      await exportarResultadosPDF(
        costos,
        oferta,
        demanda,
        asignaciones,
        costoTotal,
        obtenerNombreMetodo(),
        'resultado-transporte'
      );
    } catch (error) {
      setErroresValidacion([
        `Error al exportar PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      ]);
    }
  };

  /* ===================================================================
     FUNCIÓN PRINCIPAL DE RESOLUCIÓN
     =================================================================== */

  const resolver = () => {
    // Validar el problema antes de resolver
    const validacion = validarProblemaTransporte(costos, oferta, demanda);
    if (!validacion.esValido) {
      setErroresValidacion(validacion.errores);
      return;
    }

    // Verificar límites de matriz
    if (costos.length > limitesMetodo.maxFilas || costos[0].length > limitesMetodo.maxColumnas) {
      setErroresValidacion([
        `La configuración actual supera el límite recomendado para ${obtenerNombreMetodo()}: ${limitesMetodo.maxFilas}×${limitesMetodo.maxColumnas}.`,
      ]);
      return;
    }

    setErroresValidacion([]);

    let nombreMetodo = '';
    try {
      if (modoSeleccionado === 'paso-a-paso') {
        // Resolver con el método seleccionado
        let resultado;
        switch (metodoSeleccionado) {
          case 'noroeste':
            resultado = esquinaNoroeste(costos, oferta, demanda);
            nombreMetodo = 'Esquina Noroeste';
            break;
          case 'costo-minimo':
            resultado = costoMinimo(costos, oferta, demanda);
            nombreMetodo = 'Costo Mínimo';
            break;
          case 'vogel':
            resultado = aproximacionVogel(costos, oferta, demanda);
            nombreMetodo = 'Aproximación de Vogel';
            break;
        }
        setPasos(resultado.pasos);
        setAsignaciones(resultado.asignaciones);
        setCostoTotal(resultado.costoTotal);
        setPasoActual(0);
        setResultadosComparacion([]);
        guardarEnHistorial(nombreMetodo, 'Paso a paso', resultado.costoTotal, resultado.asignaciones);
      } else {
        // Modo comparación: resolver con los tres métodos
        const resultadoNoroeste = esquinaNoroeste(costos, oferta, demanda);
        const resultadoCostoMinimo = costoMinimo(costos, oferta, demanda);
        const resultadoVogel = aproximacionVogel(costos, oferta, demanda);

        setResultadosComparacion([
          { metodo: 'Esquina Noroeste', costo: resultadoNoroeste.costoTotal, asignaciones: resultadoNoroeste.asignaciones },
          { metodo: 'Costo Mínimo', costo: resultadoCostoMinimo.costoTotal, asignaciones: resultadoCostoMinimo.asignaciones },
          { metodo: 'Aproximación de Vogel', costo: resultadoVogel.costoTotal, asignaciones: resultadoVogel.asignaciones },
        ]);

        // Seleccionar el mejor resultado
        const mejor = [resultadoNoroeste, resultadoCostoMinimo, resultadoVogel].sort((a, b) => a.costoTotal - b.costoTotal)[0];
        setAsignaciones(mejor.asignaciones);
        setCostoTotal(mejor.costoTotal);
        setPasos([]);

        const mejorNombreMetodo = mejor === resultadoNoroeste ? 'Esquina Noroeste' : 
                                  mejor === resultadoCostoMinimo ? 'Costo Mínimo' : 'Aproximación de Vogel';
        guardarEnHistorial(mejorNombreMetodo, 'Comparación', mejor.costoTotal, mejor.asignaciones);
      }
    } catch (error) {
      setErroresValidacion([error instanceof Error ? error.message : 'No se pudo calcular la solución.']);
    }
  };

  /* ===================================================================
     VARIABLES DERIVADAS
     =================================================================== */

  // Determinar si se pueden agregar filas/columnas
  const puedeAgregarFila = costos.length < limitesMetodo.maxFilas;
  const puedeAgregarColumna = costos[0].length < limitesMetodo.maxColumnas;

  // Asignaciones y celdas a mostrar según el modo
  const asignacionesActuales = modoSeleccionado === 'paso-a-paso' && pasos.length > 0
    ? pasos[pasoActual].asignaciones
    : asignaciones;

  const celdasResaltadas = modoSeleccionado === 'paso-a-paso' && pasos.length > 0
    ? pasos[pasoActual].celdasResaltadas
    : [];

  /* ===================================================================
     RENDERIZADO
     =================================================================== */

  return (
    <div className="min-h-screen bg-background p-5 md:p-10">
      <div className="max-w-[1920px] mx-auto space-y-8">
        {/* ===== ENCABEZADO ===== */}
        <header className="panel-banner">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Título y descripción */}
            <div className="flex items-center gap-5">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-md">
                <Calculator className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">Problema de Transporte</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Investigación de Operaciones - ULEAM
                </p>
              </div>
            </div>
            
            {/* Botones de acción */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setMostrarAyuda(true)}
                className="btn btn-secondary"
              >
                <HelpCircle className="w-4 h-4" />
                Ayuda
              </button>
              <button
                onClick={() => setMostrarHistorial(!mostrarHistorial)}
                className="btn btn-secondary"
              >
                <HistoryIcon className="w-4 h-4" />
                Historial
              </button>
              <button
                onClick={reiniciar}
                className="btn btn-muted"
              >
                <RotateCcw className="w-4 h-4" />
                Reiniciar
              </button>
              {/* {costoTotal > 0 && (
                <button
                  onClick={exportarResultados}
                  className="btn btn-success"
                >
                  <Download className="w-4 h-4" />
                  Exportar
                </button>
              )} */}
            </div>
          </div>
        </header>
{/* Cambios */}
        {/* ===== CONTENIDO PRINCIPAL ===== */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Columna izquierda: entrada de datos */}
          <div className="xl:col-span-3 space-y-8">
            {/* Selector de tamaño de matriz */}
            <section className="card p-6 md:p-7">
              <h2 className="text-lg font-medium mb-4 text-foreground">Configuración del Problema</h2>
              <SelectorMatriz alSeleccionar={manejarSeleccionMatriz} />
            </section>

            {/* Tabla de costos y capacidades */}
            <section className="card p-6 md:p-7">
              <h2 className="text-lg font-medium mb-4 text-foreground">Tabla de Costos y Capacidades</h2>
              <TablaCostos
                costos={costos}
                oferta={oferta}
                demanda={demanda}
                alCambiarCosto={manejarCambioCosto}
                alCambiarOferta={manejarCambioOferta}
                alCambiarDemanda={manejarCambioDemanda}
                alAgregarFila={manejarAgregarFila}
                alAgregarColumna={manejarAgregarColumna}
                alEliminarFila={manejarEliminarFila}
                alEliminarColumna={manejarEliminarColumna}
                alLimpiarDatos={manejarLimpiarDatos}
                puedeAgregarFila={puedeAgregarFila}
                puedeAgregarColumna={puedeAgregarColumna}
                limiteFilas={limitesMetodo.maxFilas}
                limiteColumnas={limitesMetodo.maxColumnas}
                celdasResaltadas={celdasResaltadas.map(c => ({ fila: c.fila, columna: c.columna }))}
                asignaciones={asignacionesActuales}
              />
            </section>

            {/* Exportar e importar matrices */}
            <section className="card p-6 md:p-7">
              <h2 className="text-lg font-medium mb-4 text-foreground">Gestión de Matrices</h2>
              <BotonesExportarImportar
                costos={costos}
                oferta={oferta}
                demanda={demanda}
                alImportar={manejarImportarMatrices}
                nombreArchivo="matriz-transporte"
              />
            </section>
          </div>

          {/* Columna derecha: controles y panel lateral */}
          <aside className="space-y-8 h-full flex flex-col">
            {mostrarHistorial ? (
              <PanelHistorial
                historial={historial}
                alCargar={cargarEntradaHistorial}
                alEliminar={(id) => {
                  const nuevoHistorial = historial.filter(h => h.id !== id);
                  setHistorial(nuevoHistorial);
                  localStorage.setItem('historialTransporte', JSON.stringify(nuevoHistorial));
                }}
                alLimpiar={() => {
                  setHistorial([]);
                  localStorage.removeItem('historialTransporte');
                }}
              />
            ) : (
              <div className="card flex flex-col justify-between flex-1 min-h-[440px] p-6 md:p-7">
                <div className="flex-1">
                  <SelectorMetodo
                    metodoSeleccionado={metodoSeleccionado}
                    modoSeleccionado={modoSeleccionado}
                    alCambiarMetodo={setMetodoSeleccionado}
                    alCambiarModo={setModoSeleccionado}
                  />
                </div>
                <div className="mt-6">
                  <button
                    onClick={resolver}
                    className="btn btn-primary w-full py-3"
                  >
                    Resolver Problema
                  </button>
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* ===== PANELES DE RESULTADOS ===== */}
        
        {/* Panel paso a paso */}
        {modoSeleccionado === 'paso-a-paso' && pasos.length > 0 && (
          <section className="card p-6 md:p-7">
            <PanelPasos
              pasos={pasos}
              costos={costos}
              pasoActual={pasoActual}
              alCambiarPaso={setPasoActual}
            />
          </section>
        )}

        {/* Panel de comparación */}
        {modoSeleccionado === 'comparacion' && resultadosComparacion.length > 0 && (
          <section className="card p-6 md:p-7">
            <PanelComparacion resultados={resultadosComparacion} />
          </section>
        )}

        {/* ===== MODALES ===== */}
        
        {/* Modal de ayuda */}
        <ModalAyuda estaAbierto={mostrarAyuda} alCerrar={() => setMostrarAyuda(false)} />
        
        {/* Modal de errores de validación */}
        <Dialog open={mostrarModalValidacion} onOpenChange={setMostrarModalValidacion}>
          <DialogContent className="sm:max-w-md border-destructive/50 bg-card">
            <DialogHeader>
              <DialogTitle className="text-destructive">Validación no permitida</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {erroresValidacion[0]}
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
