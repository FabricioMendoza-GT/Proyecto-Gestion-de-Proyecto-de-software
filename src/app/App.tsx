import { useState, useEffect } from 'react';
import { Calculator, Download, RotateCcw, HelpCircle, History as HistoryIcon } from 'lucide-react';
import { TransportTable } from './components/TransportTable';
import { MethodSelector, TransportMethod, SolutionMode } from './components/MethodSelector';
import { StepByStepPanel, Step } from './components/StepByStepPanel';
import { ComparisonPanel } from './components/ComparisonPanel';
import { MatrixSelector } from './components/MatrixSelector';
import { HelpModal } from './components/HelpModal';
import { HistoryPanel, HistoryEntry } from './components/HistoryPanel';
import { ResultsCard } from './components/ResultsCard';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './components/ui/dialog';
import {
  northwestCorner,
  minimumCost,
  vogelApproximation,
  validateTransportProblem,
  METHOD_LIMITS,
} from './utils/transportAlgorithms';

export default function App() {
  const [costs, setCosts] = useState<number[][]>([
    [8, 6, 10, 9],
    [9, 12, 13, 7],
    [14, 9, 16, 5],
  ]);
  const [supply, setSupply] = useState<number[]>([35, 50, 40]);
  const [demand, setDemand] = useState<number[]>([45, 20, 30, 30]);
  const [selectedMethod, setSelectedMethod] = useState<TransportMethod>('northwest');
  const [selectedMode, setSelectedMode] = useState<SolutionMode>('step-by-step');
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<Step[]>([]);
  const [allocations, setAllocations] = useState<number[][]>([]);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [comparisonResults, setComparisonResults] = useState<any[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showValidationModal, setShowValidationModal] = useState(false);

  const sanitizeNumber = (value: number) => {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.min(1_000_000, value));
  };

  const getMethodLimits = () => {
    const selectedLimits = (() => {
      switch (selectedMethod) {
        case 'northwest':
          return METHOD_LIMITS.northwest;
        case 'minimum-cost':
          return METHOD_LIMITS.minimumCost;
        case 'vogel':
          return METHOD_LIMITS.vogel;
        default:
          return METHOD_LIMITS.northwest;
      }
    })();

    if (selectedMode === 'comparison') {
      return {
        maxRows: Math.min(selectedLimits.maxRows, METHOD_LIMITS.vogel.maxRows),
        maxCols: Math.min(selectedLimits.maxCols, METHOD_LIMITS.vogel.maxCols),
      };
    }

    return selectedLimits;
  };

  const methodLimits = getMethodLimits();

  // Cuando hay un mensaje de validación, se muestra un modal temporal y se cierra solo.
  useEffect(() => {
    if (validationErrors.length === 0) {
      setShowValidationModal(false);
      return;
    }

    setShowValidationModal(true);
    const timeoutId = window.setTimeout(() => {
      setShowValidationModal(false);
      setValidationErrors([]);
    }, 4000);

    return () => window.clearTimeout(timeoutId);
  }, [validationErrors]);

  // Cargar el historial guardado en localStorage al iniciar la aplicación.
  useEffect(() => {
    const savedHistory = localStorage.getItem('transportHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory).map((entry: any) => ({
        ...entry,
        date: new Date(entry.date)
      })));
    }
  }, []);

  // Guardar cada solución calculada en el historial local.
  const saveToHistory = (methodName: string, mode: string, cost: number, allocs: number[][]) => {
    const entry: HistoryEntry = {
      id: Date.now().toString(),
      date: new Date(),
      method: methodName,
      mode: mode,
      totalCost: cost,
      dimensions: `${costs.length}×${costs[0].length}`,
      costs: costs,
      supply: supply,
      demand: demand,
      allocations: allocs,
    };
    const newHistory = [entry, ...history].slice(0, 20); // Mantener solo los últimos 20 registros.
    setHistory(newHistory);
    localStorage.setItem('transportHistory', JSON.stringify(newHistory));
  };

  const handleCostChange = (row: number, col: number, value: string) => {
    if (value.trim().startsWith('-')) {
      setValidationErrors(['No se permiten números negativos.']);
      return;
    }

    const newCosts = [...costs];
    newCosts[row][col] = sanitizeNumber(Number(value));
    setCosts(newCosts);
    setValidationErrors([]);
  };

  const handleSupplyChange = (index: number, value: string) => {
    if (value.trim().startsWith('-')) {
      setValidationErrors(['No se permiten números negativos.']);
      return;
    }

    const newSupply = [...supply];
    newSupply[index] = sanitizeNumber(Number(value));
    setSupply(newSupply);
    setValidationErrors([]);
  };

  const handleDemandChange = (index: number, value: string) => {
    if (value.trim().startsWith('-')) {
      setValidationErrors(['No se permiten números negativos.']);
      return;
    }

    const newDemand = [...demand];
    newDemand[index] = sanitizeNumber(Number(value));
    setDemand(newDemand);
    setValidationErrors([]);
  };

  const handleAddRow = () => {
    // Antes de agregar una fila, se respeta el límite recomendado del método.
    if (costs.length >= methodLimits.maxRows) {
      setValidationErrors([`Para ${getMethodName()} el máximo recomendado es ${methodLimits.maxRows} orígenes.`]);
      return;
    }
    setCosts([...costs, Array(costs[0].length).fill(0)]);
    setSupply([...supply, 0]);
    setValidationErrors([]);
  };

  const handleAddColumn = () => {
    // Antes de agregar una columna, se respeta el límite recomendado del método.
    if (costs[0].length >= methodLimits.maxCols) {
      setValidationErrors([`Para ${getMethodName()} el máximo recomendado es ${methodLimits.maxCols} destinos.`]);
      return;
    }
    setCosts(costs.map(row => [...row, 0]));
    setDemand([...demand, 0]);
    setValidationErrors([]);
  };

  const handleRemoveRow = (index: number) => {
    if (costs.length > 1) {
      setCosts(costs.filter((_, i) => i !== index));
      setSupply(supply.filter((_, i) => i !== index));
      setValidationErrors([]);
    }
  };

  const handleRemoveColumn = (index: number) => {
    if (costs[0].length > 1) {
      setCosts(costs.map(row => row.filter((_, i) => i !== index)));
      setDemand(demand.filter((_, i) => i !== index));
      setValidationErrors([]);
    }
  };

  const solve = () => {
    const validation = validateTransportProblem(costs, supply, demand);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    if (costs.length > methodLimits.maxRows || costs[0].length > methodLimits.maxCols) {
      setValidationErrors([
        `La configuración actual supera el límite recomendado para ${getMethodName()}: ${methodLimits.maxRows}x${methodLimits.maxCols}.`,
      ]);
      return;
    }

    setValidationErrors([]);

    let methodName = '';
    try {
      if (selectedMode === 'step-by-step') {
      let result;
      switch (selectedMethod) {
        case 'northwest':
          result = northwestCorner(costs, supply, demand);
          methodName = 'Esquina Noroeste';
          break;
        case 'minimum-cost':
          result = minimumCost(costs, supply, demand);
          methodName = 'Costo Mínimo';
          break;
        case 'vogel':
          result = vogelApproximation(costs, supply, demand);
          methodName = 'Aproximación de Vogel';
          break;
      }
      setSteps(result.steps);
      setAllocations(result.allocations);
      setTotalCost(result.totalCost);
      setCurrentStep(0);
      setComparisonResults([]);
      saveToHistory(methodName, 'Paso a paso', result.totalCost, result.allocations);
      } else {
        const nw = northwestCorner(costs, supply, demand);
        const mc = minimumCost(costs, supply, demand);
        const vogel = vogelApproximation(costs, supply, demand);

        setComparisonResults([
          { method: 'Esquina Noroeste', cost: nw.totalCost, allocations: nw.allocations },
          { method: 'Costo Mínimo', cost: mc.totalCost, allocations: mc.allocations },
          { method: 'Aproximación de Vogel', cost: vogel.totalCost, allocations: vogel.allocations },
        ]);

        const best = [nw, mc, vogel].sort((a, b) => a.totalCost - b.totalCost)[0];
        setAllocations(best.allocations);
        setTotalCost(best.totalCost);
        setSteps([]);

        const bestMethodName = best === nw ? 'Esquina Noroeste' : best === mc ? 'Costo Mínimo' : 'Aproximación de Vogel';
        saveToHistory(bestMethodName, 'Comparación', best.totalCost, best.allocations);
      }
    } catch (error) {
      setValidationErrors([error instanceof Error ? error.message : 'No se pudo calcular la solución.']);
    }
  };

  const handleMatrixSelect = (rows: number, cols: number) => {
    // La selección rápida de matriz también valida que no exceda el límite permitido.
    if (rows > methodLimits.maxRows || cols > methodLimits.maxCols) {
      setValidationErrors([
        `La matriz seleccionada supera el límite recomendado para ${getMethodName()}: ${methodLimits.maxRows}x${methodLimits.maxCols}.`,
      ]);
      return;
    }
    setCosts(Array(rows).fill(0).map(() => Array(cols).fill(0)));
    setSupply(Array(rows).fill(0));
    setDemand(Array(cols).fill(0));
    setSteps([]);
    setAllocations([]);
    setTotalCost(0);
    setCurrentStep(0);
    setComparisonResults([]);
    setValidationErrors([]);
  };

  const loadHistoryEntry = (entry: HistoryEntry) => {
    setCosts(entry.costs);
    setSupply(entry.supply);
    setDemand(entry.demand);
    setAllocations(entry.allocations);
    setTotalCost(entry.totalCost);
    setSteps([]);
    setComparisonResults([]);
    setShowHistory(false);
  };

  const reset = () => {
    setCosts([
      [8, 6, 10, 9],
      [9, 12, 13, 7],
      [14, 9, 16, 5],
    ]);
    setSupply([35, 50, 40]);
    setDemand([45, 20, 30, 30]);
    setSteps([]);
    setAllocations([]);
    setTotalCost(0);
    setCurrentStep(0);
    setComparisonResults([]);
    setValidationErrors([]);
  };

  const canAddRow = costs.length < methodLimits.maxRows;
  const canAddColumn = costs[0].length < methodLimits.maxCols;

  const exportResults = () => {
    const data = {
      method: selectedMethod,
      mode: selectedMode,
      costs,
      supply,
      demand,
      allocations,
      totalCost,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transporte-resultados.json';
    a.click();
  };

  const currentAllocations = selectedMode === 'step-by-step' && steps.length > 0
    ? steps[currentStep].allocations
    : allocations;

  const highlightedCells = selectedMode === 'step-by-step' && steps.length > 0
    ? steps[currentStep].highlightedCells
    : [];

  const totalAllocations = allocations.reduce((sum, row) =>
    sum + row.filter(val => val > 0).length, 0
  );

  const getMethodName = () => {
    switch (selectedMethod) {
      case 'northwest': return 'Esquina Noroeste';
      case 'minimum-cost': return 'Costo Mínimo';
      case 'vogel': return 'Aproximación de Vogel';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-[1920px] mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl shadow-md">
                  <Calculator className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl">Problema de Transporte</h1>
                  <p className="text-sm text-slate-600 mt-1">Investigación de Operaciones - Resolver y Comparar Métodos</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowHelp(true)}
                className="flex items-center gap-2 px-4 py-2 border-2 border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-all"
              >
                <HelpCircle className="w-4 h-4" />
                Ayuda
              </button>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2 px-4 py-2 border-2 border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 transition-all"
              >
                <HistoryIcon className="w-4 h-4" />
                Historial
              </button>
              <button
                onClick={reset}
                className="flex items-center gap-2 px-4 py-2 border-2 border-slate-300 rounded-lg hover:bg-slate-50 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Reiniciar
              </button>
              {totalCost > 0 && (
                <button
                  onClick={exportResults}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  <Download className="w-4 h-4" />
                  Exportar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Se ocultaron las tarjetas resumen superiores para reducir el ruido visual. */}

        {/* Contenido principal */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Columna izquierda: entrada de datos */}
          <div className="xl:col-span-3 space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
              <h2 className="mb-4">Configuración del Problema</h2>
              <MatrixSelector onSelect={handleMatrixSelect} />
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
              <h2 className="mb-4">Tabla de Costos y Capacidades</h2>
              <TransportTable
                costs={costs}
                supply={supply}
                demand={demand}
                onCostChange={handleCostChange}
                onSupplyChange={handleSupplyChange}
                onDemandChange={handleDemandChange}
                onAddRow={handleAddRow}
                onAddColumn={handleAddColumn}
                onRemoveRow={handleRemoveRow}
                onRemoveColumn={handleRemoveColumn}
                canAddRow={canAddRow}
                canAddColumn={canAddColumn}
                rowLimit={methodLimits.maxRows}
                columnLimit={methodLimits.maxCols}
                highlightedCells={highlightedCells}
                allocations={currentAllocations}
              />
            </div>

            {/* Los paneles de iteración o comparación se muestran debajo de esta cuadrícula. */}

          </div>

          {/* Columna derecha: controles y pasos */}
          <div className="space-y-6 h-full flex flex-col">
            {showHistory ? (
              <HistoryPanel
                history={history}
                onLoad={loadHistoryEntry}
                onDelete={(id) => {
                  const newHistory = history.filter(h => h.id !== id);
                  setHistory(newHistory);
                  localStorage.setItem('transportHistory', JSON.stringify(newHistory));
                }}
                onClear={() => {
                  setHistory([]);
                  localStorage.removeItem('transportHistory');
                }}
              />
            ) : (
              <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200 flex flex-col justify-between flex-1 min-h-[440px]">
                <div className="flex-1">
                  <MethodSelector
                    selectedMethod={selectedMethod}
                    selectedMode={selectedMode}
                    onMethodChange={setSelectedMethod}
                    onModeChange={setSelectedMode}
                  />
                </div>
                <div className="mt-4">
                  <button
                    onClick={solve}
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    Resolver Problema
                  </button>
                </div>
              </div>
            )}

            
          </div>
        </div>

        {/* Paneles de ancho completo: iteración paso a paso o comparación de métodos. */}
        {selectedMode === 'step-by-step' && steps.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
            <StepByStepPanel
              steps={steps}
              currentStep={currentStep}
              onStepChange={setCurrentStep}
            />
          </div>
        )}

        {selectedMode === 'comparison' && comparisonResults.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
            <ComparisonPanel results={comparisonResults} />
          </div>
        )}

        {/* Modales */}
        <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
        {/* Modal temporal para mostrar errores de validación sin interrumpir el flujo. */}
        <Dialog open={showValidationModal} onOpenChange={setShowValidationModal}>
          <DialogContent className="sm:max-w-md border-red-200 bg-white">
            <DialogHeader>
              <DialogTitle className="text-red-600">Validación no permitida</DialogTitle>
              <DialogDescription className="text-slate-600">
                {validationErrors[0]}
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}