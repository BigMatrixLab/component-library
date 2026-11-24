import { Slider } from 'ui-kit';

const bands = [
  { label: 'Bass', value: 60 },
  { label: 'Mid', value: 35 },
  { label: 'Treble', value: 75 },
];

export default function SliderVertical() {
  return (
    <div className="flex items-start gap-10 pb-2 pr-12" role="group" aria-label="Equaliser">
      {bands.map((band) => (
        <div key={band.label} className="grid justify-items-center gap-3">
          <Slider orientation="vertical" aria-label={band.label} defaultValue={[band.value]} />
          <span className="text-sm text-muted-foreground" aria-hidden="true">
            {band.label}
          </span>
        </div>
      ))}
    </div>
  );
}
