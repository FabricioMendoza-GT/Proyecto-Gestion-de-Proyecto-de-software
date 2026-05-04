import { TrendingDown, Package, Truck, DollarSign } from 'lucide-react';

interface ResultsCardProps {
  totalCost: number;
  method: string;
  totalAllocations: number;
  dimensions: string;
}

export function ResultsCard({ totalCost, method, totalAllocations, dimensions }: ResultsCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm opacity-90">Costo Total</span>
          <DollarSign className="w-5 h-5 opacity-80" />
        </div>
        <div className="text-3xl mb-1">${totalCost.toLocaleString()}</div>
        <div className="text-xs opacity-75">Costo calculado</div>
      </div>

      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm opacity-90">Método</span>
          <TrendingDown className="w-5 h-5 opacity-80" />
        </div>
        <div className="text-xl mb-1">{method}</div>
        <div className="text-xs opacity-75">Algoritmo utilizado</div>
      </div>

      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm opacity-90">Asignaciones</span>
          <Package className="w-5 h-5 opacity-80" />
        </div>
        <div className="text-3xl mb-1">{totalAllocations}</div>
        <div className="text-xs opacity-75">Rutas activas</div>
      </div>

      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm opacity-90">Dimensiones</span>
          <Truck className="w-5 h-5 opacity-80" />
        </div>
        <div className="text-3xl mb-1">{dimensions}</div>
        <div className="text-xs opacity-75">Orígenes × Destinos</div>
      </div>
    </div>
  );
}
