import { Kbd, KbdGroup } from 'ui-kit';

export default function KbdShortcuts() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-wrap items-center justify-center gap-6">
        <Kbd>Esc</Kbd>
        <Kbd>Enter</Kbd>
        <Kbd>Tab</Kbd>
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
        <KbdGroup plus>
          <Kbd>Ctrl</Kbd>
          <Kbd>Shift</Kbd>
          <Kbd>P</Kbd>
        </KbdGroup>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-6">
        <KbdGroup>
          <Kbd size="sm">⌘</Kbd>
          <Kbd size="sm">S</Kbd>
        </KbdGroup>
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>S</Kbd>
        </KbdGroup>
        <KbdGroup>
          <Kbd size="lg">⌘</Kbd>
          <Kbd size="lg">S</Kbd>
        </KbdGroup>
      </div>
    </div>
  );
}
