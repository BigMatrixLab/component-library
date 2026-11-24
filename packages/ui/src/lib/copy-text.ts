/**
 * Copy text to the clipboard. Uses the async Clipboard API where it is available
 * (secure contexts); otherwise falls back to a hidden textarea and `execCommand('copy')`
 * (older browsers, http pages, some embedded webviews). Resolves to whether it worked.
 */
export async function copyText(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Permission denied or not focused: try the fallback
    }
  }
  return legacyCopy(text);
}

function legacyCopy(text: string): boolean {
  if (typeof document === 'undefined') return false;
  const active = document.activeElement as HTMLElement | null;
  // Inside a modal <dialog> everything outside it is inert, so the textarea must live in it
  const host = active?.closest('dialog') ?? document.body;
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.setAttribute('aria-hidden', 'true');
  area.style.position = 'fixed';
  area.style.top = '0';
  area.style.left = '-9999px';
  area.style.opacity = '0';
  host.appendChild(area);
  let ok = false;
  try {
    area.focus({ preventScroll: true });
    area.select();
    area.setSelectionRange(0, text.length);
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  } finally {
    host.removeChild(area);
    active?.focus?.({ preventScroll: true });
  }
  return ok;
}
