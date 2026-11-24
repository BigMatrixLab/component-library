'use client';

import { RadialChart } from 'ui-kit';

const goals = [
  { goal: 'Signups', progress: 86 },
  { goal: 'Activation', progress: 64 },
  { goal: 'Retention', progress: 41 },
];

export default function RadialGoals() {
  return (
    <div className="mx-auto w-full max-w-sm">
      <RadialChart
        data={goals}
        index="goal"
        valueKey="progress"
        max={100}
        valueFormat="percent"
        centerLabel="Quarter goals"
        height={260}
      />
    </div>
  );
}
