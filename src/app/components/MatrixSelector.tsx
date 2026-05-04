import { Grid3x3 } from 'lucide-react';

interface MatrixSelectorProps {
  onSelect: (rows: number, cols: number) => void;
}

export function MatrixSelector({ onSelect }: MatrixSelectorProps) {
  const presets = [
    { label: '2x2', rows: 2, cols: 2 },
    { label: '3x3', rows: 3, cols: 3 },
    { label: '3x4', rows: 3, cols: 4 },
    { label: '4x4', rows: 4, cols: 4 },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Grid3x3 className="w-4 h-4" />
        <span>Tamaño de matriz</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {presets.map((preset) => (
          <button
            key={preset.label}
            onClick={() => onSelect(preset.rows, preset.cols)}
            className="px-4 py-2 bg-white border-2 border-slate-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all"
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
