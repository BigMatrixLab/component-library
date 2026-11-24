'use client';

export interface LegendItem {
  key: string;
  label: string;
  color: string;
  visible: boolean;
}

/** Legend whose items are toggle buttons: pressing one hides or shows that series. */
export function ChartLegend({
  items,
  onToggle,
  label = 'Toggle series',
}: {
  items: LegendItem[];
  onToggle: (key: string) => void;
  label?: string;
}) {
  return (
    <div className="ui-chart-legend" role="group" aria-label={label}>
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          className="ui-chart-legend-item"
          aria-pressed={item.visible}
          onClick={() => onToggle(item.key)}
        >
          <span className="ui-chart-swatch" style={{ background: item.color }} aria-hidden="true" />
          {item.label}
        </button>
      ))}
    </div>
  );
}
