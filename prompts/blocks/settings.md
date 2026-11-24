## Block: Settings

An account and workspace settings page: a header, then sidebar tabs (Account, Notifications, Billing, Danger zone) with one panel at a time. Built only from ui-kit components plus Tailwind utilities, in one self-contained client component file.

### Anatomy
```
root                       @container, rounded-xl, 1px border, bg-background, overflow-hidden; ResizeObserver decides the layout
  header                   border-bottom, px 20 → 32 (wide), py 20: h1 “Settings” 24px/600 + muted lead
  Tabs variant="underline" orientation = wide ? vertical : horizontal   (wide = block width ≥ 672px)
    TabsList               aria-label “Settings sections”; wide: 12rem column with the indicator on its right edge;
                           narrow: a scrolling row with 20px side margins
      TabsTrigger × 4      Icon (user, bell, credit-card, triangle-alert) + label; the danger tab turns destructive-text when active
    TabsContent × 4        direct children of Tabs; wide: max-width 42rem; narrow: 20px side margins
```

Panels (each starts with an h2 20px/600 + muted 14px description):
- **Account** — `Form` (noValidate, gap 24px): Avatar xl + “Upload photo” (outline sm, upload icon) + “Remove” (ghost sm) + hint; Full name / Display name in two columns from @xl; Email read-only with a success Badge “Verified”; Bio `Textarea` (rows 3, maxLength 160, showCount); Time zone `NativeSelect`; save bar.
- **Notifications** — h3 “Email” section: `Switch` rows with label + description, `labelPosition="start"` (switch on the right); one disabled-on row “Billing receipts”. `Separator`. h3 “Push notifications”: `RadioGroup` with three items (label + description). Save bar “Save preferences”.
- **Billing** — bordered box: “Pro plan” + success Badge with dot “Active”, price and renewal line, “Cancel plan” (outline) + “Upgrade to Business” (primary); Separator; Seats and Storage `Progress` meters (tone warning at ≥ 80%) in two columns from @xl. Bordered row: card brand chip, “Visa ending in 4242”, “Update card”. h3 “Invoices” + `Table` (Invoice, Date, Amount numeric, Status Badge “Paid”, icon download button with aria-label).
- **Danger zone** — one rounded box with a destructive/40 border and dividers: Transfer ownership (outline), Export all data (outline, download icon), Delete workspace (title in destructive-text, destructive button).

Save bar: top border, right-aligned; a role="status" slot showing check + “Saved” in success-text, then the submit Button.

### Behaviour
- Save: the button shows `loading` for ~0.9s, then “Saved” appears; the next change or click in that form clears it.
- Account validates the name on submit: “Enter your name. It’s shown on comments and invoices.” and focuses the field.
- Delete workspace opens `Dialog` with `role="alertdialog"`, size sm. The confirm input (autoFocus) must equal the workspace slug exactly before “Delete workspace” enables; while deleting, the dialog is not dismissible and Cancel is disabled. Closing clears the input. Afterwards a warning `Alert` (“Workspace scheduled for deletion”) with a “Restore workspace” link appears above the box and the delete button is disabled.
- Tabs: automatic activation, arrow keys follow the current orientation; the panel rises in only after the first change.

### Visual rules
- Semantic tokens only; no gradients; no shadows except the dialog.
- Section titles h2 20px/600 display font; group titles h3 15px/600.
- Boxes: rounded-xl, 1px border, 20px padding.

### Responsive
- Wide (≥ 672px of block width): vertical tabs on the left, content on the right. Narrow: horizontal scrolling tabs above the content. Two-column field rows collapse to one below @xl (36rem).
- Works from 360px: action buttons wrap under their text.

### Accessibility
- WAI-ARIA tabs with aria-orientation matching the layout; each panel is labelled by its tab.
- Groups are `<section aria-labelledby>`; the RadioGroup is labelled by its h3.
- Disabled switch explains itself in its description. Icon-only buttons have aria-labels.

### Acceptance checks
- At 1024px the tab list is vertical; at 390px it is a horizontal row and the panel sits under it.
- Clearing Full name and saving shows the error; a valid save shows “Saved”.
- In the delete dialog the button stays disabled until “northwind-finance” is typed.
