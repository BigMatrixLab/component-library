import { expect, test, type Page } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc } from './helpers';

const PAGE = '/docs/components/file-dropzone';

// 1x1 transparent PNG
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);

const pdf = (name: string, bytes = 2048) => ({ name, mimeType: 'application/pdf', buffer: Buffer.alloc(bytes) });

const documents = (page: Page) => example(page, 0);

test.describe('FileDropzone', () => {
  test('picking files lists them with name and size', async ({ page }) => {
    const { errors } = await openDoc(page, PAGE);
    const dz = documents(page);
    await dz.locator('input[type="file"]').setInputFiles([pdf('contract.pdf'), pdf('invoice.pdf', 3 * 1024)]);
    const rows = dz.locator('.ui-file-row');
    await expect(rows).toHaveCount(2);
    await expect(rows.first().locator('.ui-file-row-name')).toHaveText('contract.pdf');
    await expect(rows.first()).toContainText('2 KB');
    await expect(rows.nth(1)).toContainText('3 KB');
    expect(errors).toEqual([]);
  });

  test('wrong type, oversized and too many files each give a clear error row', async ({ page }) => {
    await openDoc(page, PAGE);
    const dz = documents(page);
    const input = dz.locator('input[type="file"]');

    await input.setInputFiles([{ name: 'virus.exe', mimeType: 'application/x-msdownload', buffer: Buffer.alloc(10) }, pdf('ok.pdf')]);
    await expect(dz.getByRole('alert')).toContainText("virus.exe isn't an accepted file type. Use PDF, DOCX or XLSX.");
    await expect(dz.locator('.ui-file-row')).toHaveCount(1);

    await input.setInputFiles(pdf('huge.pdf', 11 * 1024 * 1024));
    await expect(dz.getByRole('alert')).toContainText('huge.pdf is 11 MB. The limit is 10 MB.');
    await expect(dz.locator('.ui-file-row')).toHaveCount(1);

    await input.setInputFiles([pdf('a.pdf', 10), pdf('b.pdf', 20), pdf('c.pdf', 30), pdf('d.pdf', 40), pdf('e.pdf', 50)]);
    await expect(dz.locator('.ui-file-row')).toHaveCount(5);
    await expect(dz.getByRole('alert')).toContainText('The limit is 5 files.');

    await dz.getByRole('button', { name: 'Dismiss error' }).click();
    await expect(dz.getByRole('alert')).toBeHidden();
  });

  test('shows per-file progress and then the uploaded state', async ({ page }) => {
    await openDoc(page, PAGE);
    const dz = documents(page);
    await dz.locator('input[type="file"]').setInputFiles(pdf('contract.pdf'));
    const bar = dz.getByRole('progressbar', { name: 'Uploading contract.pdf' });
    await expect(bar).toBeVisible();
    await expect(dz.locator('.ui-file-row')).toContainText('Uploaded', { timeout: 10_000 });
    await expect(bar).toBeHidden();
  });

  test('remove deletes the row and returns focus to the target', async ({ page }) => {
    await openDoc(page, PAGE);
    const dz = documents(page);
    await dz.locator('input[type="file"]').setInputFiles(pdf('contract.pdf'));
    await dz.getByRole('button', { name: 'Remove contract.pdf' }).click();
    await expect(dz.locator('.ui-file-row')).toHaveCount(0);
    await expect(dz.locator('.ui-file-dropzone-zone')).toBeFocused();
  });

  test('Enter on the focused target opens the file chooser', async ({ page }) => {
    await openDoc(page, PAGE);
    const zone = documents(page).locator('.ui-file-dropzone-zone');
    await expect(zone).toHaveAttribute('aria-describedby', /.+/);
    await zone.focus();
    const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.keyboard.press('Enter')]);
    expect(chooser.isMultiple()).toBe(true);
    await chooser.setFiles(pdf('via-keyboard.pdf'));
    await expect(documents(page).locator('.ui-file-row-name')).toHaveText('via-keyboard.pdf');
  });

  test('dragging over tints the target; dropping adds the files', async ({ page }) => {
    await openDoc(page, PAGE);
    const zone = documents(page).locator('.ui-file-dropzone-zone');
    const data = await page.evaluateHandle(() => {
      const dt = new DataTransfer();
      dt.items.add(new File(['hello'], 'dropped.pdf', { type: 'application/pdf' }));
      return dt;
    });
    await zone.dispatchEvent('dragenter', { dataTransfer: data });
    await zone.dispatchEvent('dragover', { dataTransfer: data });
    await expect(zone).toHaveAttribute('data-dragging', '');
    const border = await zone.evaluate((e) => getComputedStyle(e).borderTopColor);
    expect(border).not.toBe('rgba(0, 0, 0, 0)');
    await zone.dispatchEvent('drop', { dataTransfer: data });
    await expect(zone).not.toHaveAttribute('data-dragging', '');
    await expect(documents(page).locator('.ui-file-row-name')).toHaveText('dropped.pdf');
  });

  test('avatar: an image gets a thumbnail and a new pick replaces it', async ({ page }) => {
    await openDoc(page, PAGE);
    const dz = example(page, 1);
    const input = dz.locator('input[type="file"]');
    await input.setInputFiles({ name: 'me.png', mimeType: 'image/png', buffer: PNG });
    const thumb = dz.locator('.ui-file-row-thumb img');
    await expect(thumb).toHaveCount(1);
    expect(await thumb.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);

    await input.setInputFiles({ name: 'me-2.png', mimeType: 'image/png', buffer: PNG });
    await expect(dz.locator('.ui-file-row')).toHaveCount(1);
    await expect(dz.locator('.ui-file-row-name')).toHaveText('me-2.png');

    await input.setInputFiles(pdf('cv.pdf'));
    await expect(dz.getByRole('alert')).toContainText("cv.pdf isn't an accepted file type. Use Images.");
    await expect(dz.locator('.ui-file-row-name')).toHaveText('me-2.png');
  });

  test('the rules text is built from the props', async ({ page }) => {
    await openDoc(page, PAGE);
    await expect(documents(page).locator('.ui-file-dropzone-rules')).toHaveText('PDF, DOCX or XLSX · up to 10 MB each · max 5 files');
    await expect(example(page, 1).locator('.ui-file-dropzone-rules')).toHaveText('Images · up to 2 MB');
  });

  test('has no serious accessibility violations (light and dark)', async ({ page }) => {
    test.slow();
    await openDoc(page, PAGE);
    await documents(page).locator('input[type="file"]').setInputFiles(pdf('contract.pdf'));
    await expectNoA11yViolations(page, '[role="tabpanel"]');
    await openDoc(page, PAGE, { dark: true });
    await expectNoA11yViolations(page, '[role="tabpanel"]');
  });
});
