## Component: Password strength

A live 4-segment meter and a requirement checklist placed under a password input. A pure `scorePassword`
helper (no DOM) does the scoring so forms can reuse it.

### Anatomy
```
<div class="ui-password-strength" id data-level="empty|weak|fair|good|strong" data-score="0–4">
  <div class="ui-password-strength-header">
    <div class="ui-password-strength-meter" role="meter" aria-label="Password strength"
         aria-valuemin="0" aria-valuemax="4" aria-valuenow aria-valuetext="Good">
      <span class="ui-password-strength-segment" [data-filled] style="--ui-i: n"></span> × 4
    </div>
    <span class="ui-password-strength-label" aria-live="polite" aria-atomic="true">Good</span>
  </div>
  <ul class="ui-password-strength-checklist" aria-label="Password requirements">
    <li class="ui-password-strength-requirement" data-id [data-met]>
      <span class="ui-password-strength-mark" aria-hidden="true"><svg check 10px, stroke 3/></span>
      <span class="ui-password-strength-sr">Met: | Not met: </span>
      <span class="ui-password-strength-text">At least 8 characters</span>
    </li>
  </ul>
</div>
```

### Props
- `value` (string, required); `requirements` (`{ id, label, test(password) }[]`, default 8+ characters,
  upper and lower case, a number, a symbol); `labels` (`{ weak, fair, good, strong }`, default
  Weak / Fair / Good / Strong); `showChecklist` (default true); `showLabel` (default true);
  `meterLabel` (default "Password strength"). Native div props forwarded (`id`, `ref`, `className`).
- Exports: `PasswordStrength`, `scorePassword`, `defaultPasswordRequirements`, `passwordStrengthLevels`,
  `passwordHasSequence`, `isCommonPassword` and their types.

### Scoring (`scorePassword`)
- Empty → score 0, level `empty`, nothing met. Requirements are never met by an empty password.
- Points: length (in code points) 8–11 → 1, 12–15 → 2, 16+ → 3; plus character classes − 1 (lower, upper,
  number, symbol = anything not a letter or number); minus 1 for a straight run of 4 (`abcd`, `4321`).
- Map: 0–1 → 1 weak, 2–3 → 2 fair, 4 → 3 good, 5+ → 4 strong.
- A common password (contains `password`, `qwerty`, `123456`…) or one repeated character → 1.
- Strong (4) only when every requirement is met; otherwise capped at 3.

### Visual rules
- Root: grid, 10px gap, 13px text. Tone by level: weak `--ui-destructive` / `--ui-destructive-text`, fair
  `--ui-warning` / `--ui-warning-text`, good and strong `--ui-success` / `--ui-success-text`.
- Header: flex, 12px gap. Meter: 4 equal columns, 4px gap; segment 4px tall, pill radius, track
  `color-mix(in oklch, var(--ui-foreground) 10%, transparent)`; fill is an `::after` in the tone colour.
- Label: 12px/500, min-width 52px, end-aligned, in the tone's text colour.
- Checklist: no bullets, 6px row gap; row is flex, 8px gap, `--ui-muted-foreground`, met → `--ui-foreground`.
- Mark: 16px circle, inset 1.5px `--ui-border-strong` ring; met → `--ui-success` fill and ring, check in
  `--ui-success-foreground`.

### Motion
- Segment fill: `transform: scaleX(0 → 1)` from the start edge (right in RTL) on `--ui-spring-smooth`
  (540ms), `transition-delay: calc(var(--ui-i) * var(--ui-stagger))` where `--ui-i` counts from the previous
  score (rising: i − previous − 1; falling: previous − i), so only changing segments are staggered.
- Background colour changes over `--ui-duration` (220ms) with no delay.
- Met mark: `ui-password-strength-tick` (scale .7 → 1) on `--ui-spring-snappy`; check scales .4 → 1 and
  fades in.
- Reduced motion: no stagger, no tick animation; the global rule makes transitions instant.

### Accessibility
- The input's `aria-describedby` points at the root `id`, so the field reads the strength and checklist.
- `role="meter"` with value 0–4 and the level word as value text.
- The level word is the only live region (polite, atomic), so it speaks when the level changes, not per key.
- Requirement state is in hidden text ("Met:" / "Not met:"); marks are decorative.

### Acceptance checks
- Typing `Tr0ub4dor&3` gives 3 filled segments, level `good`, all 4 requirements met.
- Typing `password` gives level `weak` and 1 filled segment.
- Clearing the field resets to `data-level="empty"` with no filled segments and an empty label.
- Each met row has `data-met` and its hidden text says "Met:".
- Works in light and dark; axe finds no serious violations.
