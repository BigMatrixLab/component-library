import { expect, test, type Page } from '@playwright/test';
import { expectNoA11yViolations, openDoc, settle } from './helpers';

const PAGES = [
  { path: '/docs/blocks/hero', examples: ['blocks/hero/centered', 'blocks/hero/split', 'blocks/hero/minimal'] },
  { path: '/docs/blocks/features', examples: ['blocks/features/icon-grid', 'blocks/features/bento', 'blocks/features/alternating'] },
  {
    path: '/docs/blocks/testimonials',
    examples: ['blocks/testimonials/quote-grid', 'blocks/testimonials/single', 'blocks/testimonials/marquee'],
  },
  { path: '/docs/blocks/cta', examples: ['blocks/cta/banner', 'blocks/cta/card'] },
  { path: '/docs/blocks/footer', examples: ['blocks/footer/multi-column', 'blocks/footer/minimal'] },
];

const preview = (page: Page, file: string) => page.locator(`[data-example="${file}"]`);

/** Scroll every preview into view so the scroll-triggered entrances run, then wait for them. */
async function revealAll(page: Page, examples: string[]) {
  for (const file of examples) await preview(page, file).scrollIntoViewIfNeeded();
  // Every scroll-triggered group has been revealed (none still waiting behind opacity-0)
  await expect(page.locator('[data-example] [class*="motion-safe:opacity-0"]')).toHaveCount(0);
  await settle(page);
}

test.describe('Marketing blocks', () => {
  for (const { path, examples } of PAGES) {
    test.describe(path, () => {
      test('renders every variant without errors', async ({ page }) => {
        const { errors } = await openDoc(page, path);
        await expect(page.locator('[data-example]')).toHaveCount(examples.length);
        for (const file of examples) await expect(preview(page, file).locator('section, footer').first()).toBeAttached();
        await revealAll(page, examples);
        // Revealed content ends fully opaque
        const hidden = await page.evaluate(() =>
          [...document.querySelectorAll<HTMLElement>('[data-example] .ui-stagger > *, [data-example] .ui-animate-rise')]
            .filter((el) => getComputedStyle(el).opacity !== '1')
            .map((el) => el.closest<HTMLElement>('[data-example]')?.dataset.example),
        );
        expect(hidden).toEqual([]);
        expect(errors).toEqual([]);
      });

      test('no horizontal overflow at 360px', async ({ page }) => {
        await page.setViewportSize({ width: 360, height: 800 });
        await openDoc(page, path);
        await revealAll(page, examples);
        const overflow = await page.evaluate(() => {
          const out: string[] = [];
          const doc = document.documentElement;
          if (doc.scrollWidth > doc.clientWidth) out.push(`document ${doc.scrollWidth} > ${doc.clientWidth}`);
          for (const el of document.querySelectorAll<HTMLElement>('[data-example]')) {
            if (el.scrollWidth > el.clientWidth + 1) out.push(`${el.dataset.example} ${el.scrollWidth} > ${el.clientWidth}`);
          }
          return out;
        });
        expect(overflow).toEqual([]);
      });

      for (const dark of [false, true]) {
        test(`has no serious accessibility violations (${dark ? 'dark' : 'light'})`, async ({ page }) => {
          test.slow(); // axe is slow in Firefox
          // Reduced motion: nothing is mid-animation or waiting to be revealed while axe measures contrast
          await page.emulateMedia({ reducedMotion: 'reduce' });
          await openDoc(page, path, { dark });
          await revealAll(page, examples);
          await expectNoA11yViolations(page, '[data-example]');
        });
      }
    });
  }

  test('marquee pauses with the button and on hover', async ({ page }) => {
    await openDoc(page, '/docs/blocks/testimonials');
    const block = preview(page, 'blocks/testimonials/marquee');
    await block.scrollIntoViewIfNeeded();
    const state = () =>
      page.evaluate(
        () =>
          document
            .getAnimations()
            .find(
              (a) =>
                a.effect?.getTiming().iterations === Infinity &&
                (a.effect as KeyframeEffect).target?.closest('[data-example="blocks/testimonials/marquee"]'),
            )?.playState,
      );
    await expect.poll(state).toBe('running');

    const button = block.getByRole('button', { name: 'Pause testimonials' });
    await button.click();
    await expect(block.getByRole('button', { name: 'Play testimonials' })).toBeVisible();
    await page.mouse.move(0, 0); // leave the row so only the button holds it
    await expect.poll(state).toBe('paused');
    await block.getByRole('button', { name: 'Play testimonials' }).click();
    await page.mouse.move(0, 0);
    await expect.poll(state).toBe('running');

    // The looping copy is hidden from assistive tech
    await expect(block.locator('[aria-hidden="true"] figure')).toHaveCount(8);
  });

  test('marquee becomes a scrollable row with reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openDoc(page, '/docs/blocks/testimonials');
    const block = preview(page, 'blocks/testimonials/marquee');
    await block.scrollIntoViewIfNeeded();
    const region = block.getByRole('region', { name: 'Testimonials' });
    await expect(region).toBeVisible();
    await expect(region.locator('figure')).toHaveCount(8);
    await expect(block.getByRole('button', { name: /testimonials/ })).toHaveCount(0);
    expect(await region.evaluate((el) => getComputedStyle(el).overflowX)).toBe('auto');
  });

  test('footer newsletter confirms in place', async ({ page }) => {
    await openDoc(page, '/docs/blocks/footer');
    const block = preview(page, 'blocks/footer/multi-column');
    await block.scrollIntoViewIfNeeded();
    await block.getByLabel('The release notes, monthly').fill('ada@example.com');
    await block.getByRole('button', { name: 'Subscribe' }).click();
    await expect(block.getByRole('status')).toHaveText('Thanks! The next issue goes to ada@example.com.');
  });
});
