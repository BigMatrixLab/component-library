## Component: FileDropzone

A drop target with a real file input behind it, validation with error rows, and a list of the picked files. It never uploads; the app listens to `onFilesChange` and reports progress through `fileStatus`.

### Anatomy
```
<div class="ui-file-dropzone">
  <div class="ui-file-dropzone-zone [ui-file-dropzone-compact]" role="button" tabindex="0"
       aria-labelledby=title aria-describedby=rules(+field) data-dragging data-disabled data-invalid>
    <span class="ui-file-dropzone-icon" aria-hidden>icon</span>
    <span class="ui-file-dropzone-text">
      <span class="ui-file-dropzone-title">Click to upload (link style) or drag and drop</span>
      <span class="ui-file-dropzone-rules">PDF, DOCX or XLSX · up to 10 MB each · max 5 files</span>
    </span>
  </div>
  <input type="file" class="ui-file-dropzone-input" tabindex="-1" aria-hidden="true">   sibling of the zone, visually hidden
  <ul class="ui-file-errors" role="alert"><li class="ui-file-error">alert icon, message, dismiss button</li></ul>
  <ul class="ui-file-list" aria-label="Selected files">
    <li class="ui-file-row" data-status="idle|uploading|success|error">
      <span class="ui-file-row-thumb"><img> | file / image icon</span>
      <span class="ui-file-row-body">name · meta (size, %, Uploaded, error text) · Progress (sm) while uploading · extra</span>
      status icon (success / error) · <button class="ui-file-row-remove" aria-label="Remove {name}">
    </li>
  </ul>
</div>
```

### Props
- `value` / `defaultValue` (`File[]`), `onFilesChange(files)`, `onReject(rejections)` where a rejection is `{ file, code: 'invalid-type' | 'too-large' | 'too-many', message }`.
- `accept` (input syntax: `.ext`, `type/*`, `type/sub`), `multiple` (default false: a new valid pick replaces the file; an invalid pick keeps the old one), `maxSize` (bytes), `maxFiles`, `disabled`, `name` (mirrors the list into the real input with `DataTransfer` so forms submit it).
- `title`, `rules` (default built from accept / maxSize / maxFiles; `null` hides), `icon` (default `upload`), `variant` `default | compact`, `children` (replaces the target content), `showList`, `previews`, `fileStatus(file) → { status?, progress?, message? }`, `renderFileExtra(file)`, `removeLabel(file)`, `zoneClassName`.
- Inside a Field: `useFieldControl` — the id goes on the hidden input (so the Label opens the picker); describedby and disabled apply to the target.
- Helpers (`file-utils.ts`): `formatBytes`, `matchesAccept`, `describeAccept`, `validateFiles`, `fileKey` (`name:size:lastModified`).

### Behaviour
- Click, Enter or Space (when the zone itself is focused) calls `input.click()`. The input is a sibling, never inside the zone, so its click cannot re-enter the handler.
- Drag: only when `dataTransfer.types` includes `Files`. `dragenter` / `dragleave` are counted so child elements do not flicker; `data-dragging` is set while over; `drop` clears it and validates `dataTransfer.files`. Disabled: `dropEffect = none`, nothing is added.
- Validation per file in order: type, size, then count; files already in the list are skipped; overflow past the limit is reported once ("3 files were not added. The limit is 5 files."). Messages name the file and the rule ("report.exe isn't an accepted file type. Use PDF, DOCX or XLSX.", "scan.pdf is 12 MB. The limit is 10 MB.").
- Errors are replaced by the next pick, cleared on remove, and individually dismissible.
- Image thumbnails use `URL.createObjectURL`, revoked on change and unmount.
- Removing a file moves focus to the target.

### Visual rules
- Target: 1.5px dashed `--ui-border-strong`, radius lg, bg `--ui-surface-muted` 45%, min height 9rem, padding 24 / 20px, centred column, gap 12px. Hover (fine pointer): border mixes toward foreground, bg 80%. Focus-visible: 3px ring at 45% and ring-coloured border. Dragging: border `--ui-primary`, bg primary 7%, `scale(1.01)`; the 40px icon circle turns primary 14% / `--ui-primary-text` and lifts 2px. Invalid: destructive border. Disabled: opacity .5.
- Title 14px / 500, link part `--ui-primary-text` underlined; rules 13px `--ui-muted-foreground`. Compact: a row, left-aligned, no min height, padding 14 / 16px.
- Error row: destructive 8% bg, 24% border, `--ui-destructive-text`, radius md, 13px.
- File row: 1px `--ui-border`, radius lg, `--ui-surface`, padding 10 / 8 / 10 / 10px, gap 12px. Thumb 40px square, radius md, `--ui-surface-muted`, image `object-fit: cover`. Name 14px / 500 truncated; meta 12px muted, destructive text on error. Success icon `--ui-success-text`; error row border mixes destructive 40%. Remove button 32px (44px on coarse pointers), muted, hover `--ui-accent`.

### Motion
- Zone and icon: transform on `--ui-spring-snappy`; colours 150ms. Rows and errors `ui-rise-in`. Progress glides (Progress component). Reduced motion drops movement.

### Accessibility
- The target is a button named by the title and described by the rules. Real input is `aria-hidden` with `tabindex="-1"`.
- Errors `role="alert"`; progress bars named "Uploading {name}"; remove buttons name the file.
- Everything drag and drop does is available with the keyboard and the picker.

### Acceptance checks
- Choosing files through the input lists them with name and size; images get a thumbnail `img`.
- A wrong type, an oversized file and the overflow each produce one error row naming the rule; valid files in the same pick are still added.
- Single mode replaces the file.
- Dropping files (DataTransfer) adds them and sets `data-dragging` during dragover.
- Enter on the focused target opens the picker; remove returns focus to the target.
- `fileStatus` progress shows a progress bar with matching `aria-valuenow`.
- No axe violations in light and dark.
