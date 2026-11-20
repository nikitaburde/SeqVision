import type { RenderableTensor } from "@/simulation/runtime";

export function TensorGrid({ tensor }: { tensor: RenderableTensor }) {
  const [rows, columns] = tensor.shape;
  const scale = Math.max(Math.abs(tensor.stats.min), Math.abs(tensor.stats.max));
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-1 text-center font-mono text-xs">
        <caption className="pb-2 text-left font-sans text-sm text-muted-foreground">{tensor.name} · {rows} × {columns}</caption>
        <tbody>
          {Array.from({ length: rows }, (_, row) => (
            <tr key={row}>
              {tensor.values.slice(row * columns, (row + 1) * columns).map((value, column) => (
                <td key={column} title={String(value)} className="rounded px-1 py-2 tabular-nums"
                  style={{ backgroundColor: value < 0 ? "var(--color-rose-500)" : "var(--color-sky-500)", color: "#020617", opacity: 0.7 + 0.3 * (scale ? Math.abs(value) / scale : 0) }}>
                  {value.toFixed(3)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TensorStats({ tensor }: { tensor: RenderableTensor }) {
  const { mean, variance, min, max, memoryBytes, distribution } = tensor.stats;
  const peak = Math.max(...distribution);
  return (
    <div className="space-y-3 text-sm">
      <dl className="grid grid-cols-2 gap-2">
        {Object.entries({ Mean: mean.toFixed(4), Variance: variance.toFixed(4), Min: min.toFixed(4), Max: max.toFixed(4), "Float32 bytes": memoryBytes }).map(([label, value]) => (
          <div key={label}><dt className="text-muted-foreground">{label}</dt><dd className="font-mono">{value}</dd></div>
        ))}
      </dl>
      <div>
        <p className="text-muted-foreground">Value distribution</p>
        <div className="flex h-16 items-end gap-1">
          {distribution.map((count, bin) => (
            <div key={bin} role="img" aria-label={`Bin ${bin + 1}: ${count} values`} title={`${count} values`}
              className="flex-1 rounded-t bg-primary" style={{ height: `${100 * count / peak}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
