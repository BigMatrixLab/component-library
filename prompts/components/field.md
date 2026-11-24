## Component: Field & label

Wires a label, one form control, helper text and a validation message together: shared id, `aria-describedby`, `aria-invalid`, `required`. Also a fieldset/legend pair and a form grid helper. Controls (`Input`, `PasswordInput`, `Textarea`, `NativeSelect`) work standalone and inside a Field.

### Anatomy
```
<Form class="ui-form">                       native <form>, grid, gap 20px
  <Field class="ui-field [ui-field-horizontal]">   context: ids, invalid, required, disabled
    <Label class="ui-label">Email (data-required adds the marker with ::after)</Label>
    <Input | Textarea | NativeSelect />      picks id / aria / required / disabled from context
    <FieldHint class="ui-field-hint" />      <p id="…-hint">
    <FieldError class="ui-field-error" />    <p id="…-error" role="alert"> icon + text
  <Fieldset class="ui-fieldset"><Legend class="ui-legend" />…</Fieldset>
```

### Props
- `Field`: `orientation` (`vertical` default · `horizontal`), `required`, `invalid`, `disabled`, `controlId` (optional id for the control; generated with `useId` otherwise), plus div props.
- `Label`: label props + `required` (defaults to the field's `required`). `htmlFor` defaults to the field's control id.
- `FieldHint`, `FieldError`: paragraph props. `FieldError` renders nothing without children.
- `Fieldset` / `Legend` / `Form`: native elements with classes; props are forwarded.
- `useFieldControl(props, extraDescribedBy?)`: hook for controls. Returns `{ id, aria-describedby, aria-invalid, required, disabled }`. Outside a Field it returns the control's own props.

### Behaviour
- Context holds `controlId`, `hintId`, `errorId`, `invalid`, `required`, `disabled`, `hasHint`, `hasError` and setters.
- `FieldHint` / `FieldError` register themselves in a layout effect; the control's `aria-describedby` lists `[its own, hint, error, extra]` only for elements that are rendered.
- A rendered `FieldError` makes the control `aria-invalid="true"` even without `invalid`. An explicit `aria-invalid` on the control wins.
- A control with its own `id` registers it with the Field, so the label's `htmlFor` follows it.
- `disabled` on Field disables the control (and sets `data-disabled` on the label). `required` sets native `required` on the control (an explicit control prop wins).

### Visual rules
- Field: grid, gap 6px. Label 14px/500, `--ui-foreground`; required marker `--ui-destructive-text`; disabled label opacity .5.
- Hint 13px, `--ui-muted-foreground`, line-height 20px. Error 13px, `--ui-destructive-text`, 14px `circle-alert` icon (stroke icons) aligned to the first line, gap 6px.
- Horizontal: two columns `minmax(0, 11rem) / 1fr`, column gap 16px; label in column 1 with min-height 36px (centred on the control); control, hint, error in column 2. Below 640px it stacks.
- Fieldset: grid, gap 16px, no border or padding. Legend 15px/600, margin-bottom 16px. Form: grid, gap 20px.

### Motion
- `FieldError` enters with `ui-rise-in` 220ms `--ui-ease-out` (8px rise, blur 4px clears). Reduced motion drops the movement (global rule).

### Accessibility
- Real `<label for>`; hint/error ids in `aria-describedby`; error has an icon (not colour alone) and `role="alert"`; the required marker is CSS generated content with empty alt text (`content: "*" / ""`), so the control carries the native `required` attribute and the label text stays clean.

### Acceptance checks
- Clicking the label focuses the control; `getByLabel('Email', { exact: true })` finds it (the marker is not part of the name).
- Rendering a `FieldError` sets `aria-invalid="true"` and adds the error id to `aria-describedby`; removing it restores both.
- A disabled Field disables its control; a required Field sets `required`.
- Horizontal layout puts the label to the left of the control on desktop and stacks on phones.
- No axe violations in light and dark.
