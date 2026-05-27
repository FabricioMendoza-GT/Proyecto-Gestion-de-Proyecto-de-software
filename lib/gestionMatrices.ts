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

/**
 * Exporta los resultados de un problema de transporte a un archivo PDF.
 * 
 * @param costos - Matriz de costos (orígenes x destinos)
 * @param oferta - Vector de ofertas por origen
 * @param demanda - Vector de demandas por destino
 * @param asignaciones - Matriz de asignaciones (solución)
 * @param costoTotal - Costo total de la solución
 * @param metodo - Nombre del método utilizado (ej: "Esquina Noroeste")
 * @param nombreArchivo - Nombre del archivo a descargar (sin extensión)
 * 
 * @example
 * exportarResultadosPDF(
 *   costos,
 *   oferta,
 *   demanda,
 *   asignaciones,
 *   costoTotal,
 *   "Esquina Noroeste",
 *   "resultado-transporte"
 * );
 */
export async function exportarResultadosPDF(
  costos: number[][],
  oferta: number[],
  demanda: number[],
  asignaciones: number[][],
  costoTotal: number,
  metodo: string = 'No especificado',
  nombreArchivo: string = 'resultado-transporte'
): Promise<void> {
  // Importar jsPDF dinámicamente para evitar problemas de SSR
  const { jsPDF } = await import('jspdf');
  const { autoTable } = await import('jspdf-autotable');

  // Crear documento PDF
  const doc = new jsPDF();
  let posicionY = 15;

  // Configuración de estilos
  const colorPrimario = [33, 150, 243]; // Azul
  const colorSecundario = [66, 133, 244]; // Azul más claro

  /* ===== ENCABEZADO ===== */
  doc.setFontSize(20);
  doc.setTextColor(...colorPrimario);
  doc.text('Problema de Transporte', 15, posicionY);

  posicionY += 10;
  doc.setFontSize(11);
  doc.setTextColor(80, 80, 80);
  doc.text(`Método: ${metodo}`, 15, posicionY);
  posicionY += 6;
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')} - ${new Date().toLocaleTimeString('es-ES')}`, 15, posicionY);
  posicionY += 12;

  /* ===== SECCIÓN: DATOS DE ENTRADA ===== */
  doc.setFontSize(13);
  doc.setTextColor(...colorPrimario);
  doc.text('Datos de Entrada', 15, posicionY);
  posicionY += 8;

  // Tabla de costos
  const tablaCostos = [
    ['Origen \\ Destino', ...demanda.map((_, i) => `D${i + 1}`), 'Oferta'],
    ...costos.map((fila, idxFila) => [
      `O${idxFila + 1}`,
      ...fila,
      oferta[idxFila],
    ]),
    ['Demanda', ...demanda, ''],
  ];

  autoTable(doc, {
    head: [tablaCostos[0]],
    body: tablaCostos.slice(1),
    startY: posicionY,
    headStyles: {
      fillColor: colorPrimario,
      textColor: 255,
      fontSize: 10,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 9,
      halign: 'center',
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240],
    },
    margin: { left: 15, right: 15 },
  });

  // Ajustar posición después de la tabla
  posicionY = (doc as any).lastAutoTable.finalY + 12;

  /* ===== SECCIÓN: ASIGNACIONES (SOLUCIÓN) ===== */
  doc.setFontSize(13);
  doc.setTextColor(...colorPrimario);
  doc.text('Solución: Matriz de Asignaciones', 15, posicionY);
  posicionY += 8;

  const tablaAsignaciones = [
    ['Origen \\ Destino', ...demanda.map((_, i) => `D${i + 1}`)],
    ...asignaciones.map((fila, idxFila) => [
      `O${idxFila + 1}`,
      ...fila,
    ]),
  ];

  autoTable(doc, {
    head: [tablaAsignaciones[0]],
    body: tablaAsignaciones.slice(1),
    startY: posicionY,
    headStyles: {
      fillColor: colorSecundario,
      textColor: 255,
      fontSize: 10,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 9,
      halign: 'center',
    },
    alternateRowStyles: {
      fillColor: [240, 248, 255],
    },
    margin: { left: 15, right: 15 },
  });

  // Ajustar posición después de la tabla
  posicionY = (doc as any).lastAutoTable.finalY + 12;

  /* ===== SECCIÓN: COSTO TOTAL ===== */
  doc.setFontSize(13);
  doc.setTextColor(...colorPrimario);
  doc.text('Resultado Final', 15, posicionY);
  posicionY += 8;

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`Costo Total: $${costoTotal.toFixed(2)}`, 15, posicionY);
  posicionY += 8;

  // Línea separadora
  doc.setDrawColor(...colorPrimario);
  doc.line(15, posicionY, 195, posicionY);
  posicionY += 8;

  /* ===== NOTA AL PIE ===== */
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text('Generado por: Sistema de Problemas de Transporte - ULEAM', 15, posicionY);

  // Descargar PDF
  doc.save(`${nombreArchivo}.pdf`);

  console.log(`✓ Resultados exportados como PDF: ${nombreArchivo}.pdf`);
}
