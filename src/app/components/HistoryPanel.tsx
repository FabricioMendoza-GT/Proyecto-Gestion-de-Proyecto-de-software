import { History, Search, Trash2, Calendar, Cpu } from 'lucide-react';
import { useState } from 'react';

export interface HistoryEntry {
  id: string;
  date: Date;
  method: string;
  mode: string;
  totalCost: number;
  dimensions: string;
  costs: number[][];
  supply: number[];
  demand: number[];
  allocations: number[][];
}

interface HistoryPanelProps {
  history: HistoryEntry[];
  onLoad: (entry: HistoryEntry) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}

export function HistoryPanel({ history, onLoad, onDelete, onClear }: HistoryPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = history.filter(entry =>
    entry.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.dimensions.includes(searchTerm)
  );

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-slate-200 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-blue-500" />
          <h3>Historial</h3>
          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
            {history.length}
          </span>
        </div>
        {history.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors"
          >
            Limpiar todo
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por método o tamaño..."
          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none text-sm"
        />
      </div>

      {/* History List */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            {history.length === 0 ? 'No hay problemas resueltos aún' : 'No se encontraron resultados'}
          </div>
        ) : (
          filteredHistory.map((entry) => (
            <div
              key={entry.id}
              className="border border-slate-200 rounded-lg p-3 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Cpu className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span className="text-sm truncate">{entry.method}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(entry.date)}
                    </div>
                    <span className="bg-slate-100 px-2 py-0.5 rounded">
                      {entry.dimensions}
                    </span>
                  </div>
                  <div className="mt-2 text-lg text-blue-600">
                    ${entry.totalCost.toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onLoad(entry)}
                    className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                  >
                    Cargar
                  </button>
                  <button
                    onClick={() => onDelete(entry.id)}
                    className="p-1 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
