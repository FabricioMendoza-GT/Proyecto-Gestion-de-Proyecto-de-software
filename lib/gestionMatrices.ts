import type { Paso } from '@/lib/algoritmos-transporte';
import {
  estaAgotado,
  etiquetaDestino,
  etiquetaOrigen,
  explicarPasoTransporte,
  formatearNumeroTransporte,
  formatearPenalidadVogel,
} from '@/lib/presentacion-transporte';

interface DatosCeldaAutoTable {
  section: 'head' | 'body' | 'foot';
  row: { index: number };
  column: { index: number };
  cell: {
    styles: {
      fillColor: string | number | number[];
      textColor: string | number | number[];
      fontStyle: string;
    };
  };
}

/**
 * =====================================================================
 * GESTIÓN DE MATRICES - EXPORTACIÓN E IMPORTACIÓN
 * Universidad Laica Eloy Alfaro de Manabí (ULEAM)
 * 
 * Este archivo proporciona funciones para exportar e importar
 * matrices de costos, ofertas y demandas en formato JSON.
 * 
 * FUNCIONES PRINCIPALES:
 * - exportarMatrices(): Descarga un archivo JSON con los datos
 * - importarMatrices(): Lee un archivo JSON y valida los datos
 * - validarFormatoMatrices(): Verifica que el JSON sea válido
 * =====================================================================
 */

/**
 * Interfaz que define la estructura de los datos guardados
 */
export interface DatosMatrices {
  /** Fecha de creación del archivo */
  fecha: string;
  /** Matriz de costos unitarios */
  costos: number[][];
  /** Vector de ofertas por origen */
  oferta: number[];
  /** Vector de demandas por destino */
  demanda: number[];
  /** Información adicional (opcional) */
  informacion?: {
    nombre?: string;
    descripcion?: string;
  };
}

/**
 * Resultado de validar datos importados
 */
export interface ResultadoValidacion {
  /** Indica si los datos son válidos */
  esValido: boolean;
  /** Errores encontrados durante la validación */
  errores: string[];
  /** Datos parseados si la validación fue exitosa */
  datos?: DatosMatrices;
}

/* =====================================================================
   FUNCIONES DE EXPORTACIÓN
   ===================================================================== */

/**
 * Exporta las matrices de costos, ofertas y demandas a un archivo JSON.
 * 
 * @param costos - Matriz de costos (orígenes x destinos)
 * @param oferta - Vector de ofertas por origen
 * @param demanda - Vector de demandas por destino
 * @param nombreArchivo - Nombre del archivo a descargar (sin extensión)
 * @param informacion - Datos opcionales adicionales
 * 
 * @example
 * exportarMatrices(costos, oferta, demanda, "problema-transporte");
 */
export function exportarMatrices(
  costos: number[][],
  oferta: number[],
  demanda: number[],
  nombreArchivo: string = "matriz-transporte",
  informacion?: { nombre?: string; descripcion?: string }
): void {
  // Crear objeto con los datos a exportar
  const datosMatrices: DatosMatrices = {
    fecha: new Date().toISOString(),
    costos,
    oferta,
    demanda,
    informacion,
  };
// cambios
  // Convertir a JSON con formato legible (2 espacios de indentación)
  const jsonString = JSON.stringify(datosMatrices, null, 2);

  // Crear un blob con el contenido JSON
  const blob = new Blob([jsonString], { type: 'application/json' });

  // Crear una URL descargable
  const url = URL.createObjectURL(blob);

  // Crear elemento <a> temporal para descargar
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = `${nombreArchivo}.json`;

  // Descargar el archivo
  document.body.appendChild(enlace);
  enlace.click();

  // Limpiar recursos
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);

  console.log(`✓ Matrices exportadas como: ${nombreArchivo}.json`);
}

/* =====================================================================
   FUNCIONES DE IMPORTACIÓN
   ===================================================================== */

/**
 * Valida que los datos importados tengan la estructura correcta.
 * 
 * @param datos - Objeto con los datos a validar
 * @returns Resultado con errores (si los hay) y los datos validados
 */
export function validarFormatoMatrices(datos: unknown): ResultadoValidacion {
  const errores: string[] = [];

  // Verificar que es un objeto
  if (!datos || typeof datos !== 'object') {
    errores.push('El archivo debe contener un objeto JSON válido');
    return { esValido: false, errores };
  }

  const obj = datos as Record<string, unknown>;

  // Verificar que exista la matriz de costos
  if (!Array.isArray(obj.costos)) {
    errores.push('El campo "costos" debe ser una matriz (array de arrays)');
  } else if (obj.costos.length === 0) {
    errores.push('La matriz de costos no puede estar vacía');
  } else if (!obj.costos.every(Array.isArray)) {
    errores.push('La matriz de costos debe contener solo arrays (matriz bidimensional)');
  } else if (!obj.costos.every((fila: unknown) => 
    Array.isArray(fila) && (fila as unknown[]).every(v => typeof v === 'number')
  )) {
    errores.push('La matriz de costos debe contener solo números');
  }

  // Verificar que exista el vector de oferta
  if (!Array.isArray(obj.oferta)) {
    errores.push('El campo "oferta" debe ser un array de números');
  } else if (obj.oferta.length === 0) {
    errores.push('El vector de oferta no puede estar vacío');
  } else if (!obj.oferta.every(v => typeof v === 'number')) {
    errores.push('El vector de oferta debe contener solo números');
  }

  // Verificar que exista el vector de demanda
  if (!Array.isArray(obj.demanda)) {
    errores.push('El campo "demanda" debe ser un array de números');
  } else if (obj.demanda.length === 0) {
    errores.push('El vector de demanda no puede estar vacío');
  } else if (!obj.demanda.every(v => typeof v === 'number')) {
    errores.push('El vector de demanda debe contener solo números');
  }

  // Si no hay errores básicos, verificar que las dimensiones coincidan
  if (errores.length === 0) {
    const numOrigenes = (obj.costos as number[][]).length;
    const numDestinos = (obj.costos as number[][])[0].length;

    if (obj.oferta && (obj.oferta as number[]).length !== numOrigenes) {
      errores.push(
        `La oferta debe tener ${numOrigenes} elementos (uno por origen)`
      );
    }

    if (obj.demanda && (obj.demanda as number[]).length !== numDestinos) {
      errores.push(
        `La demanda debe tener ${numDestinos} elementos (uno por destino)`
      );
    }

    // Verificar que todos los números sean positivos
    const todosPositivos = [
      ...(obj.costos as number[][]).flat(),
      ...(obj.oferta as number[]),
      ...(obj.demanda as number[]),
    ].every(n => n >= 0);

    if (!todosPositivos) {
      errores.push('Todos los valores deben ser números no negativos');
    }
  }

  if (errores.length > 0) {
    return { esValido: false, errores };
  }

  // Si todo es válido, retornar los datos
  const datosValidos: DatosMatrices = {
    fecha: (obj.fecha as string) || new Date().toISOString(),
    costos: obj.costos as number[][],
    oferta: obj.oferta as number[],
    demanda: obj.demanda as number[],
    informacion: obj.informacion as DatosMatrices['informacion'],
  };

  return { esValido: true, errores: [], datos: datosValidos };
}

/**
 * Importa matrices desde un archivo JSON.
 * 
 * @param archivo - Archivo JSON a leer
 * @returns Promesa que resuelve con el resultado de la validación
 * 
 * @example
 * const resultado = await importarMatrices(archivoSeleccionado);
 * if (resultado.esValido) {
 *   setCostos(resultado.datos.costos);
 *   setOferta(resultado.datos.oferta);
 *   setDemanda(resultado.datos.demanda);
 * }
 */
export async function importarMatrices(
  archivo: File
): Promise<ResultadoValidacion> {
  // Verificar que el archivo sea JSON
  if (!archivo.name.endsWith('.json')) {
    return {
      esValido: false,
      errores: ['El archivo debe tener extensión .json'],
    };
  }

  // Verificar tamaño del archivo (máximo 1 MB)
  const TAMANIO_MAXIMO = 1 * 1024 * 1024; // 1 MB
  if (archivo.size > TAMANIO_MAXIMO) {
    return {
      esValido: false,
      errores: [
        `El archivo es demasiado grande (${(archivo.size / 1024).toFixed(2)} KB). Máximo: 1 MB`,
      ],
    };
  }

  try {
    // Leer el contenido del archivo como texto
    const contenido = await archivo.text();

    // Parsear el JSON
    let datos: unknown;
    try {
      datos = JSON.parse(contenido);
    } catch (error) {
      return {
        esValido: false,
        errores: ['El archivo JSON no es válido o está corrompido'],
      };
    }

    // Validar el formato de los datos
    const validacion = validarFormatoMatrices(datos);
    return validacion;
  } catch (error) {
    return {
      esValido: false,
      errores: [
        `Error al leer el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      ],
    };
  }
}

/**
 * Abre un diálogo para seleccionar un archivo de importación.
 * Esta es una función auxiliar para facilitar la selección de archivos.
 * 
 * @returns Promesa que resuelve con el archivo seleccionado o null
 */
export function abrirSelectorArchivo(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (e: Event) => {
      const archivo = (e.target as HTMLInputElement).files?.[0];
      resolve(archivo || null);
    };

    input.click();
  });
}

/* =====================================================================
   FUNCIONES DE EXPORTACIÓN A PDF
   ===================================================================== */

/** Resultado individual incluido en el modo comparacion. */
export interface ResultadoComparacionPDF {
  metodo: string;
  costo: number;
  asignaciones: number[][];
  pasos?: Paso[];
}

export interface DatosResultadosPDF {
  costos: number[][];
  oferta: number[];
  demanda: number[];
  asignaciones: number[][];
  costoTotal: number;
  /** Metodo y modo que estaban seleccionados al presionar Resolver problema. */
  metodo: string;
  modo: 'paso-a-paso' | 'comparacion';
  pasos?: Paso[];
  resultadosComparacion?: ResultadoComparacionPDF[];
  origenesFicticios?: number[];
  destinosFicticios?: number[];
  nombreArchivo?: string;
}

/** Exporta una instantanea completa de la ultima solucion calculada. */
export async function exportarResultadosPDF(datos: DatosResultadosPDF): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const { autoTable } = await import('jspdf-autotable');
  const {
    costos,
    oferta,
    demanda,
    asignaciones,
    costoTotal,
    metodo,
    modo,
    pasos = [],
    resultadosComparacion = [],
    origenesFicticios = [],
    destinosFicticios = [],
    nombreArchivo = 'resultado-transporte',
  } = datos;

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const anchoPagina = doc.internal.pageSize.getWidth();
  const altoPagina = doc.internal.pageSize.getHeight();
  const margen = 12;
  const azul: [number, number, number] = [37, 99, 235];
  const azulClaro: [number, number, number] = [59, 130, 246];
  const indigo: [number, number, number] = [79, 70, 229];
  let y = 14;

  const finalTabla = () => {
    const documentoConTabla = doc as typeof doc & { lastAutoTable?: { finalY: number } };
    return documentoConTabla.lastAutoTable?.finalY ?? y;
  };

  const asegurarEspacio = (altoNecesario: number) => {
    if (y + altoNecesario > altoPagina - 14) {
      doc.addPage();
      y = 15;
    }
  };

  const tituloSeccion = (titulo: string) => {
    asegurarEspacio(14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...azul);
    doc.text(titulo, margen, y);
    y += 7;
  };

  const parrafo = (texto: string, color: [number, number, number] = [55, 65, 81]) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const lineas = doc.splitTextToSize(texto, anchoPagina - margen * 2) as string[];
    asegurarEspacio(lineas.length * 4.2 + 3);
    doc.setTextColor(...color);
    doc.text(lineas, margen, y);
    y += lineas.length * 4.2 + 3;
  };

  const dibujarTablaEntrada = () => {
    const encabezado = [
      'Origen / Destino',
      ...demanda.map((_, indice) => etiquetaDestino(indice, destinosFicticios)),
      'Oferta',
    ];
    const cuerpo = costos.map((fila, indiceFila) => [
      etiquetaOrigen(indiceFila, origenesFicticios),
      ...fila.map(formatearNumeroTransporte),
      formatearNumeroTransporte(oferta[indiceFila]),
    ]);
    cuerpo.push(['Demanda', ...demanda.map(formatearNumeroTransporte), '']);

    autoTable(doc, {
      head: [encabezado],
      body: cuerpo,
      startY: y,
      theme: 'grid',
      headStyles: { fillColor: azul, textColor: 255, halign: 'center', fontSize: 8 },
      bodyStyles: { halign: 'center', valign: 'middle', fontSize: demanda.length > 7 ? 6.5 : 8 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: margen, right: margen },
    });
    y = finalTabla() + 9;
  };

  const dibujarMatrizIteracion = (paso: Paso) => {
    const penalizaciones = paso.penalizacionesVogel;
    const encabezado = [
      'Origen / Destino',
      ...paso.demandaRestante.map((valor, indice) =>
        `${etiquetaDestino(indice, destinosFicticios)}\nRestante: ${formatearNumeroTransporte(valor)}`
      ),
      'Oferta restante',
      ...(penalizaciones ? ['Penalidad fila'] : []),
    ];
    const cuerpo: string[][] = paso.asignaciones.map((fila, indiceFila) => [
      `${etiquetaOrigen(indiceFila, origenesFicticios)}\nRestante: ${formatearNumeroTransporte(paso.ofertaRestante[indiceFila])}`,
      ...fila.map((valor, indiceColumna) =>
        `Costo: ${formatearNumeroTransporte(costos[indiceFila]?.[indiceColumna] ?? 0)}\nAsign.: ${valor > 0 ? formatearNumeroTransporte(valor) : '-'}`
      ),
      formatearNumeroTransporte(paso.ofertaRestante[indiceFila]),
      ...(penalizaciones ? [formatearPenalidadVogel(penalizaciones.filas[indiceFila])] : []),
    ]);

    if (penalizaciones) {
      cuerpo.push(['Penalidad columna', ...penalizaciones.columnas.map(formatearPenalidadVogel), '', '']);
    }
    cuerpo.push([
      'Demanda restante',
      ...paso.demandaRestante.map(formatearNumeroTransporte),
      '',
      ...(penalizaciones ? [''] : []),
    ]);

    autoTable(doc, {
      head: [encabezado],
      body: cuerpo,
      startY: y,
      theme: 'grid',
      rowPageBreak: 'avoid',
      headStyles: { fillColor: azulClaro, textColor: 255, halign: 'center', valign: 'middle' },
      bodyStyles: {
        halign: 'center',
        valign: 'middle',
        fontSize: demanda.length > 7 ? 5.5 : 7,
        cellPadding: demanda.length > 7 ? 1.2 : 1.8,
      },
      margin: { left: margen, right: margen },
      didParseCell: (celda: DatosCeldaAutoTable) => {
        if (celda.section !== 'body') return;
        const fila = celda.row.index;
        const columna = celda.column.index;
        const esFilaMatriz = fila < paso.asignaciones.length;
        const esColumnaMatriz = columna > 0 && columna <= paso.demandaRestante.length;
        const filaPenalidad = penalizaciones ? paso.asignaciones.length : -1;
        const filaDemanda = paso.asignaciones.length + (penalizaciones ? 1 : 0);

        if (esFilaMatriz && (estaAgotado(paso.ofertaRestante[fila]) ||
          (esColumnaMatriz && estaAgotado(paso.demandaRestante[columna - 1])))) {
          celda.cell.styles.fillColor = [254, 243, 199];
          celda.cell.styles.textColor = [120, 53, 15];
        }
        if (esFilaMatriz && esColumnaMatriz && paso.celdasResaltadas.some(
          (item) => item.fila === fila && item.columna === columna - 1
        )) {
          celda.cell.styles.fillColor = [219, 234, 254];
          celda.cell.styles.textColor = [30, 64, 175];
          celda.cell.styles.fontStyle = 'bold';
        }
        if (penalizaciones && (fila === filaPenalidad || columna === encabezado.length - 1)) {
          celda.cell.styles.fillColor = [238, 242, 255];
          celda.cell.styles.textColor = indigo;
        }
        if (penalizaciones && fila === filaPenalidad &&
          columna === penalizaciones.seleccionado.indice + 1 && penalizaciones.seleccionado.tipo === 'columna') {
          celda.cell.styles.fillColor = [199, 210, 254];
          celda.cell.styles.fontStyle = 'bold';
        }
        if (penalizaciones && esFilaMatriz && columna === encabezado.length - 1 &&
          fila === penalizaciones.seleccionado.indice && penalizaciones.seleccionado.tipo === 'fila') {
          celda.cell.styles.fillColor = [199, 210, 254];
          celda.cell.styles.fontStyle = 'bold';
        }
        if (fila === filaDemanda) {
          celda.cell.styles.fillColor = [220, 252, 231];
          celda.cell.styles.textColor = [22, 101, 52];
        }
      },
    });
    y = finalTabla() + 8;
  };

  const dibujarMatrizResultado = (resultado: ResultadoComparacionPDF) => {
    asegurarEspacio(35);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(31, 41, 55);
    doc.text(`${resultado.metodo} - Costo total: $${formatearNumeroTransporte(resultado.costo)}`, margen, y);
    y += 6;

    const cuerpo = resultado.asignaciones.map((fila, indiceFila) => [
      etiquetaOrigen(indiceFila, origenesFicticios),
      ...fila.map((valor, indiceColumna) =>
        `Costo: ${formatearNumeroTransporte(costos[indiceFila]?.[indiceColumna] ?? 0)}\nAsign.: ${valor > 0 ? formatearNumeroTransporte(valor) : '-'}`
      ),
      formatearNumeroTransporte(oferta[indiceFila]),
    ]);
    cuerpo.push(['Demanda', ...demanda.map(formatearNumeroTransporte), '']);

    autoTable(doc, {
      head: [[
        'Origen / Destino',
        ...demanda.map((_, indice) => etiquetaDestino(indice, destinosFicticios)),
        'Oferta',
      ]],
      body: cuerpo,
      startY: y,
      theme: 'grid',
      headStyles: { fillColor: azulClaro, textColor: 255, halign: 'center' },
      bodyStyles: {
        halign: 'center',
        valign: 'middle',
        fontSize: demanda.length > 7 ? 5.5 : 7,
        cellPadding: 1.5,
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: margen, right: margen },
    });
    y = finalTabla() + 9;
  };

  const explicarMetodo = (nombreMetodo: string) => {
    if (nombreMetodo === 'Esquina Noroeste') {
      return 'Este método comienza en la esquina superior izquierda. En cada iteración asigna la mayor cantidad posible entre la oferta del origen y la demanda del destino; cuando una se agota, avanza a la siguiente fila o columna. No considera los costos para decidir el recorrido.';
    }
    if (nombreMetodo === 'Costo Mínimo') {
      return 'Este método busca el menor costo unitario entre las filas y columnas que todavía tienen capacidad. Asigna allí la mayor cantidad posible, actualiza la oferta y la demanda restantes y repite la búsqueda hasta completar el problema.';
    }
    return 'Vogel calcula en cada fila y columna una penalidad: la diferencia entre sus dos costos disponibles más bajos. Selecciona la penalidad mayor y asigna en la casilla de menor costo asociada. Después actualiza capacidades y vuelve a calcular las penalidades.';
  };

  const construirCalculoCosto = (resultado: ResultadoComparacionPDF) => {
    const terminos: string[] = [];
    resultado.asignaciones.forEach((fila, indiceFila) => {
      fila.forEach((cantidad, indiceColumna) => {
        if (cantidad <= 0) return;
        const costoUnitario = costos[indiceFila]?.[indiceColumna] ?? 0;
        terminos.push(
          `${formatearNumeroTransporte(cantidad)} x $${formatearNumeroTransporte(costoUnitario)}`
        );
      });
    });
    return `${terminos.join(' + ')} = $${formatearNumeroTransporte(resultado.costo)}`;
  };

  const dibujarDesarrolloComparacion = (resultado: ResultadoComparacionPDF, posicion: number) => {
    asegurarEspacio(55);
    tituloSeccion(`${posicion}. Cómo se resolvió con ${resultado.metodo}`);
    parrafo(explicarMetodo(resultado.metodo));

    if (resultado.pasos && resultado.pasos.length > 0) {
      autoTable(doc, {
        head: [['Iteración', 'Decisión tomada', 'Costo acumulado']],
        body: resultado.pasos.map((paso, indice) => [
          `${indice + 1}`,
          paso.descripcion,
          `$${formatearNumeroTransporte(paso.costo)}`,
        ]),
        startY: y,
        theme: 'grid',
        rowPageBreak: 'avoid',
        showHead: 'everyPage',
        headStyles: { fillColor: azulClaro, textColor: 255, halign: 'center', fontSize: 8 },
        bodyStyles: { valign: 'middle', fontSize: 7.5, cellPadding: 1.7 },
        columnStyles: {
          0: { cellWidth: 20, halign: 'center' },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 34, halign: 'center', fontStyle: 'bold' },
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { left: margen, right: margen, bottom: 14 },
      });
      y = finalTabla() + 7;
    }

    parrafo(
      `Comprobación del costo total: ${construirCalculoCosto(resultado)}. Cada término multiplica las unidades asignadas por el costo unitario de su casilla.`,
      [30, 64, 175]
    );
    parrafo('La siguiente matriz reúne las asignaciones finales producidas por estas decisiones:');
    dibujarMatrizResultado(resultado);
  };

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...azul);
  doc.text('Problema de Transporte', margen, y);
  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(75, 85, 99);
  doc.text(`Método seleccionado al resolver: ${metodo}`, margen, y);
  y += 5;
  doc.text(`Modo de solución: ${modo === 'paso-a-paso' ? 'Paso a paso' : 'Comparación de métodos'}`, margen, y);
  y += 5;
  doc.text(`Fecha: ${new Date().toLocaleString('es-EC')}`, margen, y);
  y += 10;

  tituloSeccion('Datos de entrada');
  dibujarTablaEntrada();

  if (modo === 'paso-a-paso') {
    tituloSeccion(`Desarrollo paso a paso - ${metodo}`);
    parrafo(`${pasos.length} iteracion${pasos.length === 1 ? '' : 'es'} generada${pasos.length === 1 ? '' : 's'}. Cada matriz conserva las asignaciones acumuladas y muestra la oferta y demanda restante de ese momento.`);
    pasos.forEach((paso, indice) => {
      asegurarEspacio(45);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(31, 41, 55);
      doc.text(`Iteración ${indice + 1} - Costo acumulado: $${formatearNumeroTransporte(paso.costo)}`, margen, y);
      y += 6;
      parrafo(paso.descripcion);
      parrafo(`Explicación: ${explicarPasoTransporte(paso, costos, origenesFicticios, destinosFicticios)}`, [30, 64, 175]);
      dibujarMatrizIteracion(paso);
    });

    tituloSeccion('Resultado final');
    parrafo(`El método ${metodo} obtuvo un costo total de $${formatearNumeroTransporte(costoTotal)}.`);
    dibujarMatrizResultado({ metodo, costo: costoTotal, asignaciones });
  } else {
    tituloSeccion('Comparación de métodos');
    const ordenados = [...resultadosComparacion].sort((a, b) => a.costo - b.costo);
    const mejorCosto = ordenados[0]?.costo ?? costoTotal;
    autoTable(doc, {
      head: [['Posición', 'Método', 'Costo total', 'Diferencia con el mejor', 'Resultado']],
      body: ordenados.map((resultado, indice) => [
        `${indice + 1}`,
        resultado.metodo,
        `$${formatearNumeroTransporte(resultado.costo)}`,
        `$${formatearNumeroTransporte(resultado.costo - mejorCosto)}`,
        indice === 0 ? 'Mejor método' : '',
      ]),
      startY: y,
      theme: 'grid',
      headStyles: { fillColor: azul, textColor: 255, halign: 'center' },
      bodyStyles: { halign: 'center', fontSize: 8 },
      didParseCell: (celda: DatosCeldaAutoTable) => {
        if (celda.section === 'body' && celda.row.index === 0) {
          celda.cell.styles.fillColor = [220, 252, 231];
          celda.cell.styles.textColor = [21, 128, 61];
          celda.cell.styles.fontStyle = 'bold';
        }
      },
      margin: { left: margen, right: margen },
    });
    y = finalTabla() + 9;
    parrafo(`Los tres métodos parten de la misma matriz, oferta y demanda. Como el objetivo es minimizar el costo de transporte, se considera mejor el resultado con el total más bajo: $${formatearNumeroTransporte(mejorCosto)}, obtenido por ${ordenados[0]?.metodo ?? metodo}.`);
    ordenados.forEach((resultado, indice) => dibujarDesarrolloComparacion(resultado, indice + 1));
  }

  const cantidadPaginas = doc.getNumberOfPages();
  for (let pagina = 1; pagina <= cantidadPaginas; pagina++) {
    doc.setPage(pagina);
    doc.setDrawColor(209, 213, 219);
    doc.line(margen, altoPagina - 10, anchoPagina - margen, altoPagina - 10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text('Sistema de Problemas de Transporte - ULEAM', margen, altoPagina - 5.5);
    doc.text(`Página ${pagina} de ${cantidadPaginas}`, anchoPagina - margen, altoPagina - 5.5, { align: 'right' });
  }

  doc.save(`${nombreArchivo}.pdf`);
}
