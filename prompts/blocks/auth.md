## Block: Auth

Page-level compositions for signing in, signing up (with an email code step) and recovering a password. Built only from ui-kit components plus Tailwind utilities; no new CSS classes. Each variant is one self-contained client component file.

### Variants and anatomy
```
Sign in, split screen                 root: @container, rounded-xl, 1px border, bg-background, overflow-hidden
  grid  @3xl → 2 columns (1fr / 1.1fr)
    brand panel (hidden < @3xl)        bg-muted, p-10, border-right; logo top, quote (figure/blockquote/figcaption
                                       with Avatar) middle, 3 trust points with circle-check (success-text) bottom;
                                       4 concentric circles (stroke = border colour) clipped in the top-right corner
    form column                        min-height 38rem, centred, max-width 24rem (max-w-sm), px 20 → 40 (@md)
      logo (only < @3xl)
      h1 24px/600 + muted lead
      social: 2 outline buttons (Google, GitHub), side by side from @sm
      divider: labelled <Separator>or continue with email</Separator> (line on both sides)
      Form (noValidate): Field email · Field password (label row has “Forgot password?” link) · Checkbox · submit
      footer link “Create an account”
    done state                         role="status": success circle (40px), h1 “Welcome back” (focused), email, outline button

Sign up, centred card                 root: @container, bg-muted, rounded-xl border, py 40 → 56 (@md)
  Card max-width 28rem, --ui-card-padding 2rem from @md
    step form   → title (h1, 20px) + description; stacked social buttons; “or” divider;
                  Field name · Field email · Field password (hint, replaced by the error) · Checkbox terms (+ FieldError) · submit
    step verify → 44px round icon (mail), “Check your email”, email in foreground weight 500;
                  InputOTP groups [3,3], aria-label “Verification code”, autoFocus; submit disabled until 6 digits;
                  row: link “Use a different email” (arrow-left) · “Resend code in 0:SS” countdown (30s) → link “Resend code”
    step done   → success icon, “You’re all set”, primary “Go to dashboard →”

Forgot password, centred card         request (lock icon, email field, “Send reset link”)
                                      → sent (mail icon, “Check your inbox”, primary “Open email app” (mailto:),
                                         muted box with resend countdown + “Try another email”, status line after resend)
                                      footer link “Back to sign in” (arrow-left), always visible

Reset password, centred card          PasswordInput new · muted box (strength label + Progress sm + 4 requirement rows) ·
                                      PasswordInput confirm · “Update password” → done (success icon, “Password updated”)
```

### Behaviour
- Validate on submit only (`noValidate`), set every error at once, then focus the first invalid control. Typing in a field clears its own error.
- Messages: “Enter your email address.”, “Enter an email like name@company.com.”, “Enter your password.”, “Enter your full name.”, “Use at least 8 characters, including a number.”, “Accept the terms to create an account.”, “Passwords don’t match.”
- Submit buttons use `loading` while the (simulated, ~1s) request runs; they keep focus and ignore clicks.
- Step changes move focus to the new step’s heading (`tabIndex={-1}`, no outline); the verify step focuses the code field instead. Never focus on first render.
- OTP: `onComplete` verifies immediately (typing or pasting the last digit); the button is a fallback.
- Forgot password never reveals whether an account exists (“If an account exists for …”).
- Reset requirements: ≥ 10 characters, upper and lower case, a number, a symbol. Strength = rules met: 0–1 “Too weak” (destructive), 2 “Weak” (warning), 3 “Good” (info), 4 “Strong” (success). Met rows show circle-check in success-text; unmet rows a 6px dot in muted text; each row ends with sr-only “(met)” / “(not met)”.

### Visual rules
- Semantic tokens only (bg-muted, bg-card, text-muted-foreground, text-primary-text for links, text-success-text…). Brand marks keep their official colours (Google) or `currentColor` (GitHub).
- Links: 13px/500, primary-text, underline on hover. Headings use the display font, tracking-tight, weight 600.
- Round step icons: 44px, border + bg-muted (neutral) or bg-success + success-foreground (done).
- No gradients and no shadows (cards rest on their border).

### Responsive
- Container queries (`@container`, `@sm`, `@md`, `@3xl`) so the block reacts to its own width. Works from 360px: 16–20px gutters, full-width buttons.

### Accessibility
- Every control is labelled through `Field` + `Label` (or `aria-label`); hints and errors are linked by aria-describedby; errors set aria-invalid and are announced (role="alert").
- Autocomplete: `email`, `name`, `current-password`, `new-password`; the OTP input uses `one-time-code`.
- Decorative SVGs and icons are aria-hidden; the done states are role="status".

### Acceptance checks
- Submitting an empty sign-in form shows both errors and focuses the email field; a valid submit shows the spinner then “Welcome back” with focus on it.
- Sign up → valid data → code step; typing 6 digits verifies and shows “You’re all set”.
- The brand panel is hidden below 48rem of block width and the logo appears above the form.
- Mismatched reset passwords show “Passwords don’t match.” under the confirm field.
