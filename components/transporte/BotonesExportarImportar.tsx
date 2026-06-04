/**
 * =====================================================================
 * COMPONENTE: Botones Exportar/Importar
 * 
 * Proporciona botones para exportar e importar matrices de transporte.
 * Maneja la interfaz de usuario y muestra mensajes de error/éxito.
 * 
 * CÓMO MODIFICAR:
 * - Iconos: busque los imports de lucide-react
 * - Textos de botones: están en el JSX en español
 * - Colores: modifique las clases bg-* y text-*
 * =====================================================================
 */
'use client';

import { useState } from 'react';
import { Download, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import {
  exportarMatrices,
  importarMatrices,
  abrirSelectorArchivo,
} from '@/lib/gestionMatrices';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
// cambios
/* =====================================================================
   TIPOS/INTERFACES
   ===================================================================== */
interface PropsBotonesExportarImportar {
  /** Matriz de costos actual */
  costos: number[][];
  /** Vector de ofertas actual */
  oferta: number[];
  /** Vector de demandas actual */
  demanda: number[];
  /** Callback cuando se importan nuevas matrices */
  alImportar: (costos: number[][], oferta: number[], demanda: number[]) => void;
  /** Nombre del archivo al exportar (sin extensión) */
  nombreArchivo?: string;
}

/* =====================================================================
   TIPOS PARA ALERTAS
   ===================================================================== */
type TipoAlerta = 'exito' | 'error' | 'info';

interface Alerta {
  tipo: TipoAlerta;
  mensaje: string;
  mostrar: boolean;
}

/* =====================================================================
   COMPONENTE PRINCIPAL
   ===================================================================== */
export function BotonesExportarImportar({
  costos,
  oferta,
  demanda,
  alImportar,
  nombreArchivo = 'matriz-transporte',
}: PropsBotonesExportarImportar) {
  // Estado para manejar alertas de mensajes
  const [alerta, setAlerta] = useState<Alerta>({
    tipo: 'info',
    mensaje: '',
    mostrar: false,
  });

  // Estado para el botón de importación (mientras se procesa)
  const [importandoEnProgreso, setImportandoEnProgreso] = useState(false);

  /**
   * Maneja la exportación de las matrices actuales
   */
  const manejarExportacion = () => {
    try {
      exportarMatrices(costos, oferta, demanda, nombreArchivo, {
        nombre: 'Problema de Transporte',
        descripcion: 'Exportado desde la aplicación ULEAM',
      });

      mostrarAlerta('exito', '✓ Matriz exportada correctamente');
    } catch (error) {
      mostrarAlerta(
        'error',
        `Error al exportar: ${error instanceof Error ? error.message : 'Error desconocido'}`
      );
    }
  };

  /**
   * Maneja la importación de un archivo JSON
   */
  const manejarImportacion = async () => {
    try {
      setImportandoEnProgreso(true);

      // Abrir selector de archivo
      const archivo = await abrirSelectorArchivo();

      if (!archivo) {
        // Usuario canceló la selección
        setImportandoEnProgreso(false);
        return;
      }

      // Importar y validar el archivo
      const resultado = await importarMatrices(archivo);

      if (!resultado.esValido) {
        // Mostrar errores de validación
        const mensajeErrores = resultado.errores.join('\n- ');
        mostrarAlerta(
          'error',
          `Error al importar:\n- ${mensajeErrores}`
        );
        setImportandoEnProgreso(false);
        return;
      }

      // Si es válido, actualizar los datos
      if (resultado.datos) {
        alImportar(
          resultado.datos.costos,
          resultado.datos.oferta,
          resultado.datos.demanda
        );

        mostrarAlerta(
          'exito',
          `✓ Matriz importada: ${resultado.datos.costos.length} orígenes × ${resultado.datos.costos[0].length} destinos`
        );
      }

      setImportandoEnProgreso(false);
    } catch (error) {
      mostrarAlerta(
        'error',
        `Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`
      );
      setImportandoEnProgreso(false);
    }
  };

  /**
   * Muestra una alerta por un tiempo limitado
   */
  const mostrarAlerta = (tipo: TipoAlerta, mensaje: string) => {
    setAlerta({
      tipo,
      mensaje,
      mostrar: true,
    });

    // Ocultar la alerta después de 4 segundos
    setTimeout(() => {
      setAlerta(prev => ({ ...prev, mostrar: false }));
    }, 4000);
  };

  /**
   * Retorna el ícono y color según el tipo de alerta
   */
  const obtenerConfigAlerta = (tipo: TipoAlerta) => {
    switch (tipo) {
      case 'exito':
        return {
          icono: CheckCircle,
          clase: 'bg-green-50 border-green-300 text-green-900',
          claseDescripcion: 'text-green-800',
        };
      case 'error':
        return {
          icono: AlertCircle,
          clase: 'bg-red-50 border-red-300 text-red-900',
          claseDescripcion: 'text-red-800',
        };
      default:
        return {
          icono: AlertCircle,
          clase: 'bg-blue-50 border-blue-300 text-blue-900',
          claseDescripcion: 'text-blue-800',
        };
    }
  };

  const configAlerta = obtenerConfigAlerta(alerta.tipo);
  const IconoAlerta = configAlerta.icono;

  return (
    <div className="space-y-3">
      {/* ===== BOTONES DE EXPORTAR/IMPORTAR ===== */}
      <div className="flex gap-3 flex-wrap">
        {/* Botón Exportar */}
        <Button
          onClick={manejarExportacion}
          variant="outline"
          className="gap-2"
          title="Descargar las matrices en formato JSON"
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Exportar Matriz</span>
          <span className="inline sm:hidden">Exportar</span>
        </Button>

        {/* Botón Importar */}
        <Button
          onClick={manejarImportacion}
          disabled={importandoEnProgreso}
          variant="outline"
          className="gap-2"
          title="Cargar matrices desde un archivo JSON"
        >
          <Upload className="h-4 w-4" />
          <span className="hidden sm:inline">
            {importandoEnProgreso ? 'Importando...' : 'Importar Matriz'}
          </span>
          <span className="inline sm:hidden">
            {importandoEnProgreso ? 'Importando...' : 'Importar'}
          </span>
        </Button>
      </div>

      {/* ===== ALERTA DE MENSAJE ===== */}
      {alerta.mostrar && (
        <Alert className={`border-2 ${configAlerta.clase}`}>
          <IconoAlerta className="h-4 w-4" />
          <AlertDescription className={configAlerta.claseDescripcion}>
            {alerta.mensaje.split('\n').map((linea, idx) => (
              <div key={idx}>{linea}</div>
            ))}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
