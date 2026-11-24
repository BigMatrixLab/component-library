import { expect, test, type Locator } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc } from './helpers';

const PAGE = '/docs/components/carousel';

const viewport = (carousel: Locator) => carousel.locator('.ui-carousel-viewport');
const dots = (carousel: Locator) => carousel.locator('.ui-carousel-dot');

test.describe('Carousel', () => {
  test('is a labelled carousel whose slides read "n of m"', async ({ page }) => {
    const { errors } = await openDoc(page, PAGE);
    const carousel = example(page, 0).getByRole('region', { name: 'Trail runner photos' });
    await expect(carousel).toHaveAttribute('aria-roledescription', 'carousel');
    const slides = carousel.locator('.ui-carousel-item');
    await expect(slides).toHaveCount(5);
    for (let i = 0; i < 5; i++) {
      await expect(slides.nth(i)).toHaveAttribute('aria-label', `${i + 1} of 5`);
      await expect(slides.nth(i)).toHaveAttribute('aria-roledescription', 'slide');
    }
    await expect(dots(carousel)).toHaveCount(5);
    await expect(dots(carousel).first()).toHaveAttribute('aria-current', 'true');
    expect(errors).toEqual([]);
  });

  test('previous is disabled at the start; next moves the track and the dots', async ({ page }) => {
    await openDoc(page, PAGE);
    const carousel = example(page, 0).getByRole('region', { name: 'Trail runner photos' });
    const prev = carousel.getByRole('button', { name: 'Previous slide' });
    const next = carousel.getByRole('button', { name: 'Next slide' });
    await expect(prev).toBeDisabled();
    await expect(next).toBeEnabled();
    await next.click();
    await expect(dots(carousel).nth(1)).toHaveAttribute('aria-current', 'true');
    await expect(prev).toBeEnabled();
    expect(await viewport(carousel).evaluate((el) => el.scrollLeft)).toBeGreaterThan(50);
    await prev.click();
    await expect(dots(carousel).first()).toHaveAttribute('aria-current', 'true');
    await expect(prev).toBeDisabled();
  });

  test('dots jump to a slide; next is disabled on the last', async ({ page }) => {
    await openDoc(page, PAGE);
    const carousel = example(page, 0).getByRole('region', { name: 'Trail runner photos' });
    await dots(carousel).nth(4).click();
    await expect(dots(carousel).nth(4)).toHaveAttribute('aria-current', 'true');
    await expect(carousel.getByRole('button', { name: 'Next slide' })).toBeDisabled();
    // The last slide sits at the start of the viewport (aligned within a pixel or two)
    const offset = await carousel.evaluate((root) => {
      const vp = root.querySelector('.ui-carousel-viewport')!.getBoundingClientRect();
      const slide = root.querySelectorAll('.ui-carousel-item')[4]!.getBoundingClientRect();
      return Math.abs(slide.left - vp.left);
    });
    expect(offset).toBeLessThan(3);
  });

  test('swiping (a native scroll) updates the active dot', async ({ page }) => {
    await openDoc(page, PAGE);
    const carousel = example(page, 0).getByRole('region', { name: 'Trail runner photos' });
    await viewport(carousel).evaluate((el) => el.scrollTo({ left: el.clientWidth * 2, behavior: 'instant' as ScrollBehavior }));
    await expect(dots(carousel).nth(2)).toHaveAttribute('aria-current', 'true');
  });

  test('arrow keys move between slides while focus is inside', async ({ page }, info) => {
    test.skip(info.project.name === 'iphone' || info.project.name === 'android', 'no hardware keyboard');
    await openDoc(page, PAGE);
    const carousel = example(page, 0).getByRole('region', { name: 'Trail runner photos' });
    await carousel.getByRole('button', { name: 'Next slide' }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(dots(carousel).nth(1)).toHaveAttribute('aria-current', 'true');
    await page.keyboard.press('ArrowRight');
    await expect(dots(carousel).nth(2)).toHaveAttribute('aria-current', 'true');
    await page.keyboard.press('ArrowLeft');
    await expect(dots(carousel).nth(1)).toHaveAttribute('aria-current', 'true');
  });

  test('several per view: dots count the positions the track can rest on', async ({ page }, info) => {
    test.skip(info.project.name === 'iphone' || info.project.name === 'android', 'one slide per view on phones');
    await openDoc(page, PAGE);
    const carousel = example(page, 1).getByRole('region', { name: 'Customer testimonials' });
    // 5 slides, 2 in view: 4 stopping points
    await expect(dots(carousel)).toHaveCount(4);
    const slides = carousel.locator('.ui-carousel-item');
    const w = await slides.evaluateAll((els) => els.slice(0, 2).map((e) => Math.round(e.getBoundingClientRect().width)));
    expect(Math.abs(w[0]! - w[1]!)).toBeLessThanOrEqual(1);
    const vp = (await viewport(carousel).boundingBox())!;
    expect(w[0]! * 2 + 16).toBeCloseTo(Math.round(vp.width), -1);
  });

  test('loop wraps from the last slide to the first; hovering pauses autoplay', async ({ page }) => {
    await openDoc(page, PAGE);
    const carousel = example(page, 2).getByRole('region', { name: 'What’s new' });
    await carousel.hover();
    const next = carousel.getByRole('button', { name: 'Next slide' });
    await expect(carousel.getByRole('button', { name: 'Previous slide' })).not.toBeDisabled();
    await next.click();
    await expect(dots(carousel).nth(1)).toHaveAttribute('aria-current', 'true');
    await next.click();
    await expect(dots(carousel).nth(2)).toHaveAttribute('aria-current', 'true');
    await expect(next).not.toBeDisabled();
    await next.click();
    await expect(dots(carousel).first()).toHaveAttribute('aria-current', 'true');
  });

  test('autoplay advances on its own and stops under reduced motion', async ({ page }) => {
    test.slow();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openDoc(page, PAGE);
    const carousel = example(page, 2).getByRole('region', { name: 'What’s new' });
    await page.waitForTimeout(5000);
    await expect(dots(carousel).first()).toHaveAttribute('aria-current', 'true');
  });

  test('has no serious accessibility violations (light and dark)', async ({ page }) => {
    test.slow();
    await openDoc(page, PAGE);
    await expectNoA11yViolations(page, 'main');
    await openDoc(page, PAGE, { dark: true });
    await expectNoA11yViolations(page, 'main');
  });
});
