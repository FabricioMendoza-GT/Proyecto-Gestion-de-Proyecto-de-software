import { Plus, Trash2, AlertCircle } from 'lucide-react';

interface TransportTableProps {
  costs: number[][];
  supply: number[];
  demand: number[];
  onCostChange: (row: number, col: number, value: number) => void;
  onSupplyChange: (index: number, value: number) => void;
  onDemandChange: (index: number, value: number) => void;
  onAddRow: () => void;
  onAddColumn: () => void;
  onRemoveRow: (index: number) => void;
  onRemoveColumn: (index: number) => void;
  canAddRow?: boolean;
  canAddColumn?: boolean;
  rowLimit?: number;
  columnLimit?: number;
  highlightedCells?: { row: number; col: number }[];
  allocations?: number[][];
}

export function TransportTable({
  costs,
  supply,
  demand,
  onCostChange,
  onSupplyChange,
  onDemandChange,
  onAddRow,
  onAddColumn,
  onRemoveRow,
  onRemoveColumn,
  canAddRow = true,
  canAddColumn = true,
  rowLimit,
  columnLimit,
  highlightedCells = [],
  allocations = [],
}: TransportTableProps) {
  const totalSupply = supply.reduce((a, b) => a + b, 0);
  const totalDemand = demand.reduce((a, b) => a + b, 0);
  const balanceTolerance = 1e-9;
  const isEffectivelyBalanced = Math.abs(totalSupply - totalDemand) <= balanceTolerance;

  const isCellHighlighted = (row: number, col: number) => {
    return highlightedCells.some(cell => cell.row === row && cell.col === col);
  };

  return (
    <div className="space-y-4">
      {/* Balance Status */}
      <div className={`px-4 py-3 rounded-lg shadow-sm ${isEffectivelyBalanced ? 'bg-green-50 border-2 border-green-300' : 'bg-amber-50 border-2 border-amber-300'}`}>
        <div className="flex items-center gap-3">
          {isEffectivelyBalanced ? (
            <div className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-full">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : (
            <AlertCircle className="w-8 h-8 text-amber-500" />
          )}
          <div className="flex-1">
            <div className={`${isEffectivelyBalanced ? 'text-green-700' : 'text-amber-700'} mb-1`}>
              {isEffectivelyBalanced ? 'Problema Balanceado' : 'Problema NO Balanceado'}
            </div>
            <div className="text-sm text-slate-600">
              {isEffectivelyBalanced ? (
                <>Oferta total = Demanda total = <strong>{totalSupply}</strong></>
              ) : (
                <>Oferta: <strong>{totalSupply}</strong> | Demanda: <strong>{totalDemand}</strong> | Diferencia: <strong className="text-amber-600">{Math.abs(totalSupply - totalDemand)}</strong></>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 bg-slate-100 border border-slate-300"></th>
              {demand.map((_, idx) => (
                <th key={idx} className="p-2 bg-slate-100 border border-slate-300 min-w-[100px]">
                  <div className="flex items-center justify-center gap-1">
                    <span>D{idx + 1}</span>
                    {demand.length > 1 && (
                      <button
                        onClick={() => onRemoveColumn(idx)}
                        className="p-1 hover:bg-red-100 rounded transition-colors"
                      >
                        <Trash2 className="w-3 h-3 text-red-600" />
                      </button>
                    )}
                  </div>
                </th>
              ))}
              <th className="p-2 bg-blue-100 border border-slate-300">Oferta</th>
            </tr>
          </thead>
          <tbody>
            {costs.map((row, rowIdx) => (
              <tr key={rowIdx}>
                <td className="p-2 bg-slate-100 border border-slate-300">
                  <div className="flex items-center justify-center gap-1">
                    <span>O{rowIdx + 1}</span>
                    {costs.length > 1 && (
                      <button
                        onClick={() => onRemoveRow(rowIdx)}
                        className="p-1 hover:bg-red-100 rounded transition-colors"
                      >
                        <Trash2 className="w-3 h-3 text-red-600" />
                      </button>
                    )}
                  </div>
                </td>
                {row.map((cost, colIdx) => (
                  <td
                    key={colIdx}
                    className={`p-0 border border-slate-300 relative ${
                      isCellHighlighted(rowIdx, colIdx) ? 'bg-blue-100' : 'bg-white'
                    }`}
                  >
                    <input
                      type="number"
                      step="any"
                      value={cost}
                      onChange={(e) => onCostChange(rowIdx, colIdx, Number(e.target.value))}
                      className={`w-full h-full p-2 text-center border-0 outline-none focus:ring-2 focus:ring-blue-400 ${
                        isCellHighlighted(rowIdx, colIdx) ? 'bg-blue-100' : 'bg-white'
                      }`}
                      min="0"
                    />
                    {allocations[rowIdx]?.[colIdx] > 0 && (
                      <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded">
                        {allocations[rowIdx][colIdx]}
                      </div>
                    )}
                  </td>
                ))}
                <td className="p-0 border border-slate-300 bg-blue-50">
                  <input
                    type="number"
                    step="any"
                    value={supply[rowIdx]}
                    onChange={(e) => onSupplyChange(rowIdx, Number(e.target.value))}
                    className="w-full h-full p-2 text-center bg-blue-50 border-0 outline-none focus:ring-2 focus:ring-blue-400"
                    min="0"
                  />
                </td>
              </tr>
            ))}
            <tr>
              <td className="p-2 bg-green-100 border border-slate-300">Demanda</td>
              {demand.map((d, idx) => (
                <td key={idx} className="p-0 border border-slate-300 bg-green-50">
                  <input
                    type="number"
                    step="any"
                    value={d}
                    onChange={(e) => onDemandChange(idx, Number(e.target.value))}
                    className="w-full h-full p-2 text-center bg-green-50 border-0 outline-none focus:ring-2 focus:ring-blue-400"
                    min="0"
                  />
                </td>
              ))}
              <td className="p-2 bg-slate-100 border border-slate-300"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Add Row/Column Buttons */}
      <div className="flex gap-2">
        <button
          onClick={onAddRow}
          disabled={!canAddRow}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-slate-300 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Añadir Origen
        </button>
        <button
          onClick={onAddColumn}
          disabled={!canAddColumn}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:bg-slate-300 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Añadir Destino
        </button>
      </div>

      <p className="text-xs text-slate-500">
        Límite actual: {rowLimit ?? '-'} orígenes x {columnLimit ?? '-'} destinos según el método seleccionado.
      </p>
    </div>
  );
}
