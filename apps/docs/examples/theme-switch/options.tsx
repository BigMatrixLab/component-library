'use client';

import { ThemeSwitch } from 'ui-kit';

export default function ThemeSwitchOptions() {
  return (
    <>
      <ThemeSwitch size="sm" label="Theme (small)" />
      <ThemeSwitch reveal={false} label="Theme (instant swap)" />
    </>
  );
}
