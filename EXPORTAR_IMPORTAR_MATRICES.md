# 📊 Gestión de Matrices - Exportación e Importación

## Descripción

Esta funcionalidad permite **exportar e importar matrices de costos, ofertas y demandas** en formato JSON. Es una forma sencilla y funcional de:

- ✅ **Guardar** trabajos realizados para usarlos después
- ✅ **Compartir** matrices con otros usuarios
- ✅ **Reutilizar** matrices en múltiples problemas
- ✅ **Respaldar** datos importantes

## 🚀 Cómo Usar

### Exportar una Matriz

1. Completa tu tabla de costos, ofertas y demandas
2. Haz clic en el botón **"Exportar Matriz"** (en la sección "Gestión de Matrices")
3. Se descargará un archivo JSON con el nombre `matriz-transporte.json`

**El archivo contiene:**
```json
{
  "fecha": "2024-06-04T14:30:00.000Z",
  "costos": [
    [8, 6, 10, 9],
    [9, 12, 13, 7],
    [14, 9, 16, 5]
  ],
  "oferta": [35, 50, 40],
  "demanda": [45, 20, 30, 30],
  "informacion": {
    "nombre": "Problema de Transporte",
    "descripcion": "Exportado desde la aplicación ULEAM"
  }
}
```

### Importar una Matriz

1. Haz clic en el botón **"Importar Matriz"** (en la sección "Gestión de Matrices")
2. Selecciona un archivo JSON previamente exportado
3. Si el archivo es válido, los datos se cargarán automáticamente
4. Si hay errores, se mostrarán mensajes explicativos

> ⚠️ **Nota:** La aplicación valida que el archivo tenga la estructura correcta antes de importar

## 📋 Estructura de Archivos

### Archivo de Exportación

```
{
  "fecha": "ISO 8601 timestamp",
  "costos": [array bidimensional de números],
  "oferta": [array de números],
  "demanda": [array de números],
  "informacion": {
    "nombre": "string opcional",
    "descripcion": "string opcional"
  }
}
```

### Validaciones Aplicadas

- ✓ La matriz de costos no puede estar vacía
- ✓ Los vectores de oferta y demanda deben tener el tamaño correcto
- ✓ Solo se aceptan números no negativos
- ✓ Máximo de 1 MB por archivo
- ✓ Solo archivos con extensión `.json`

## 🛠️ Archivos Nuevos Creados

### 1. `lib/gestionMatrices.ts`
**Funciones principales:**
- `exportarMatrices()` - Descarga las matrices como JSON
- `importarMatrices()` - Lee y valida un archivo JSON
- `validarFormatoMatrices()` - Valida la estructura de los datos
- `abrirSelectorArchivo()` - Abre el diálogo para seleccionar archivo

**Interfaces:**
- `DatosMatrices` - Estructura de datos exportados
- `ResultadoValidacion` - Resultado de validar datos

### 2. `components/transporte/BotonesExportarImportar.tsx`
**Componente React que proporciona:**
- Botones de exportar e importar matrices
- Manejo de errores y validaciones
- Alertas de éxito/error con auto-cierre
- Interfaz responsiva para móvil y escritorio

**Props:**
- `costos` (number[][]) - Matriz de costos actual
- `oferta` (number[]) - Vector de ofertas
- `demanda` (number[]) - Vector de demandas
- `alImportar` (function) - Callback al importar exitosamente
- `nombreArchivo` (string, opcional) - Nombre del archivo a descargar

### 3. Actualización de `components/transporte/index.ts`
Se agregó la exportación del nuevo componente `BotonesExportarImportar`

### 4. Actualización de `app/page.tsx`
**Cambios realizados:**
- Importación del nuevo componente `BotonesExportarImportar`
- Nueva función `manejarImportarMatrices()` para procesar las matrices importadas
- Nueva sección "Gestión de Matrices" en la interfaz

## 💡 Ejemplo de Uso

### Exportar:
```typescript
// Automático: el botón de la interfaz maneja todo
<BotonesExportarImportar
  costos={costos}
  oferta={oferta}
  demanda={demanda}
  alImportar={manejarImportarMatrices}
/>
```

### Importar:
```typescript
// El componente abre un selector de archivo
// Si es válido, llama a alImportar con los datos
```

## 🎯 Características

### Exportación
- 📥 Descarga directa a la computadora del usuario
- 🧹 Limpieza automática de recursos
- 🎨 Formato JSON legible con indentación
- 📅 Incluye timestamp de exportación

### Importación
- 🔍 Validación completa antes de importar
- 💬 Mensajes de error detallados en español
- ✨ Interfaz amigable con selector de archivos
- 🔒 Límite de tamaño de archivo para seguridad

## 🔄 Flujo de Integración

```
Usuario                Interface              Funciones
  |                        |                     |
  +---Clic en Exportar-----→ BotonesExportarImportar
  |                        |                     |
  |                        +--exportarMatrices()--→ Descarga JSON
  |                        |                     |
  |                        ←-------OK-----------+
  |                        |
  +---Clic en Importar-----→ abrirSelectorArchivo()
  |                        |                     |
  |                        ←-----File Dialog-----+
  |                        |
  |                        +--importarMatrices()--→ Lee archivo
  |                        |                     |
  |                        +--validarFormatoMatrices()
  |                        |                     |
  |                        ←--------Validado-----+
  |                        |
  |                        +--manejarImportarMatrices()
  |                        |                     |
  |                        ←--------OK-----------+
```

## 🚫 Limitaciones y Restricciones

- **Máximo 1 MB** por archivo
- **Solo archivos JSON** (extensión .json)
- **Números no negativos** solamente
- **Matriz máxima de 10×10** según aplicación
- Estructura de datos **obligatoria**: `costos`, `oferta`, `demanda`

## 🐛 Manejo de Errores

Errores comunes y soluciones:

| Error | Causa | Solución |
|-------|-------|----------|
| "El archivo debe tener extensión .json" | Archivo con otra extensión | Guardarlo con extensión `.json` |
| "El archivo JSON no es válido" | JSON corrupto | Revisar la estructura del archivo |
| "La oferta debe tener X elementos" | Dimensiones no coinciden | Verificar que coincida con la matriz |
| "Todos los valores deben ser no negativos" | Números negativos en datos | Editarlos en la aplicación antes de exportar |
| "El archivo es demasiado grande" | Más de 1 MB | Usar una matriz más pequeña |

## 📝 Notas Técnicas

### Variables en Español
- `costos` - Matriz de costos unitarios
- `oferta` - Vector de disponibilidad por origen
- `demanda` - Vector de necesidad por destino
- `exportarMatrices` - Función de descarga
- `importarMatrices` - Función de carga

### Comentarios en Código
Todo el código incluye comentarios explicativos en español para facilitar el mantenimiento y modificación futura.

### Compatibilidad
- ✅ Funciona en navegadores modernos
- ✅ Compatible con móviles (botones responsivos)
- ✅ Sin dependencias externas adicionales

## 🔐 Seguridad

- ✓ Validación de tipo de archivo
- ✓ Validación de tamaño de archivo
- ✓ Validación de estructura de datos
- ✓ Sin acceso a directorios del sistema
- ✓ Limpieza de objetos URL después de uso

## 📞 Soporte

Para problemas o sugerencias sobre esta funcionalidad, revisa los comentarios en:
- `lib/gestionMatrices.ts`
- `components/transporte/BotonesExportarImportar.tsx`
