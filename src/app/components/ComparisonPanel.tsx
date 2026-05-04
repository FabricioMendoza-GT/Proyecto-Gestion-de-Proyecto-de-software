import { Trophy, TrendingUp, Activity } from 'lucide-react';

interface MethodResult {
  method: string;
  cost: number;
  allocations: number[][];
}

interface ComparisonPanelProps {
  results: MethodResult[];
}

export function ComparisonPanel({ results }: ComparisonPanelProps) {
  if (results.length === 0) return null;

  const sortedResults = [...results].sort((a, b) => a.cost - b.cost);
  const bestCost = sortedResults[0]?.cost;

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-md p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Activity className="w-5 h-5 text-blue-500" />
        <h3>Comparación de Métodos</h3>
      </div>

      <div className="space-y-3">
        {sortedResults.map((result, idx) => (
          <div
            key={result.method}
            className={`p-5 rounded-xl border-2 transition-all shadow-sm ${
              result.cost === bestCost
                ? 'border-green-400 bg-gradient-to-r from-green-50 to-emerald-50'
                : 'border-slate-200 bg-white hover:border-blue-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {result.cost === bestCost ? (
                  <div className="flex items-center justify-center w-10 h-10 bg-green-500 rounded-full shadow-md">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-10 h-10 bg-slate-100 rounded-full text-slate-400">
                    #{idx + 1}
                  </div>
                )}
                <div>
                  <div className={`${result.cost === bestCost ? 'text-green-700' : 'text-slate-700'}`}>
                    {result.method}
                  </div>
                  {result.cost === bestCost && (
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-600">Mejor entre métodos comparados</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl ${result.cost === bestCost ? 'text-green-600' : 'text-blue-600'}`}>
                  ${result.cost.toLocaleString()}
                </div>
                {result.cost !== bestCost && (
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-orange-500" />
                    <span className="text-xs text-orange-600">
                      +${(result.cost - bestCost).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-slate-200">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <span className="text-xs text-green-600 uppercase">Mejor costo</span>
            <div className="text-2xl text-green-700 mt-1">${bestCost.toLocaleString()}</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <span className="text-xs text-orange-600 uppercase">Diferencia máxima</span>
            <div className="text-2xl text-orange-700 mt-1">
              ${(sortedResults[sortedResults.length - 1]?.cost - bestCost).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
