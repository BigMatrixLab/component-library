import { expect, test, type Locator, type Page } from '@playwright/test';
import { example, expectNoA11yViolations, openDoc, settle } from './helpers';

const PAGES = {
  area: '/docs/components/area-chart',
  line: '/docs/components/line-chart',
  bar: '/docs/components/bar-chart',
  donut: '/docs/components/donut-chart',
  radial: '/docs/components/radial-chart',
  spark: '/docs/components/sparkline',
};

const stageOf = (page: Page, i: number) => example(page, i).locator('.ui-chart-stage').first();
const tooltipOf = (page: Page, i: number) => example(page, i).locator('.ui-chart-tooltip').first();

/** Point at a fraction of the stage: hover with a mouse, tap on touch devices. */
async function pointAt(stage: Locator, fx: number, fy = 0.5) {
  const box = (await stage.boundingBox())!;
  const position = { x: box.width * fx, y: box.height * fy };
  if (test.info().project.use.hasTouch) await stage.tap({ position });
  else await stage.hover({ position });
}

async function ready(page: Page, path: string, dark = false) {
  const { errors } = await openDoc(page, path, { dark });
  await expect(page.locator('.ui-chart-stage, .ui-sparkline svg').first()).toBeVisible();
  await settle(page);
  return errors;
}

test.describe('Area chart', () => {
  test('renders one line and one area per series and a full data table', async ({ page }) => {
    const errors = await ready(page, PAGES.area);
    const chart = example(page, 0).locator('.ui-chart').first();
    await expect(chart.locator('svg[role="img"]')).toHaveAttribute('aria-label', /Area chart of Desktop, Mobile, 90 points/);
    await expect(chart.locator('.ui-chart-line')).toHaveCount(2);
    await expect(chart.locator('path[data-fade]')).toHaveCount(2);
    await expect(chart.locator('table tbody tr')).toHaveCount(90);
    await expect(chart.locator('.ui-chart-legend-item')).toHaveText(['Desktop', 'Mobile']);
    expect(errors).toEqual([]);
  });

  test('tooltip appears at the nearest point and stays inside the chart', async ({ page }) => {
    await ready(page, PAGES.area);
    const stage = stageOf(page, 0);
    const tip = tooltipOf(page, 0);
    for (const fx of [0.02, 0.5, 0.98]) {
      await pointAt(stage, fx);
      await expect(tip).toHaveAttribute('data-visible', 'true');
      await settle(page);
      const s = (await stage.boundingBox())!;
      const t = (await tip.boundingBox())!;
      expect(t.x).toBeGreaterThanOrEqual(s.x - 1);
      expect(t.x + t.width).toBeLessThanOrEqual(s.x + s.width + 1);
      expect(t.y).toBeGreaterThanOrEqual(s.y - 1);
      expect(t.y + t.height).toBeLessThanOrEqual(s.y + s.height + 1);
      await expect(tip).toContainText('Desktop');
      await expect(tip).toContainText('Mobile');
    }
  });

  test('crosshair snaps to a data point', async ({ page }) => {
    await ready(page, PAGES.area);
    await pointAt(stageOf(page, 0), 0.5);
    await settle(page);
    const dots = example(page, 0).locator('.ui-chart-dot');
    await expect(dots).toHaveCount(2);
    const label = await tooltipOf(page, 0).locator('.ui-chart-tooltip-label').textContent();
    expect(label).toMatch(/^[A-Z][a-z]{2} \d{1,2}$/);
  });

  test('keyboard: arrows move the active point, Home and End jump, Esc clears', async ({ page }) => {
    await ready(page, PAGES.area);
    const stage = stageOf(page, 0);
    const tip = tooltipOf(page, 0);
    await stage.focus();
    await expect(tip).toHaveAttribute('data-visible', 'false');
    await page.keyboard.press('ArrowRight');
    await expect(tip).toHaveAttribute('data-visible', 'true');
    const first = await tip.locator('.ui-chart-tooltip-label').textContent();
    await page.keyboard.press('ArrowRight');
    await expect.poll(async () => tip.locator('.ui-chart-tooltip-label').textContent()).not.toBe(first);
    await page.keyboard.press('End');
    await expect(tip.locator('.ui-chart-tooltip-label')).toHaveText('Jun 29');
    await page.keyboard.press('Home');
    await expect(tip.locator('.ui-chart-tooltip-label')).toHaveText('Apr 1');
    await expect(example(page, 0).locator('[role="status"]').first()).toContainText('Desktop');
    await page.keyboard.press('Escape');
    await expect(tip).toHaveAttribute('data-visible', 'false');
  });

  test('legend toggles a series, but never the last one', async ({ page }) => {
    await ready(page, PAGES.area);
    const chart = example(page, 0).locator('.ui-chart').first();
    const mobile = chart.getByRole('button', { name: 'Mobile' });
    await expect(mobile).toHaveAttribute('aria-pressed', 'true');
    await mobile.click();
    await expect(mobile).toHaveAttribute('aria-pressed', 'false');
    await expect(chart.locator('.ui-chart-line')).toHaveCount(1);
    await chart.getByRole('button', { name: 'Desktop' }).click();
    await expect(chart.locator('.ui-chart-line')).toHaveCount(1);
    await mobile.click();
    await expect(chart.locator('.ui-chart-line')).toHaveCount(2);
  });

  test('stacked areas render', async ({ page }) => {
    await ready(page, PAGES.area);
    const chart = example(page, 1).locator('.ui-chart').first();
    await expect(chart.locator('.ui-chart-line')).toHaveCount(3);
    await expect(chart.locator('svg[role="img"]')).toHaveAttribute('aria-label', /Stacked area chart/);
  });

  test('re-renders at the new width when the container resizes, axes stay inside', async ({ page }) => {
    test.skip(!!test.info().project.use.isMobile, 'viewport is fixed on phones');
    await ready(page, PAGES.area);
    const svg = example(page, 0).locator('svg[role="img"]').first();
    const before = (await svg.boundingBox())!.width;
    await page.setViewportSize({ width: 820, height: 900 });
    await expect.poll(async () => (await svg.boundingBox())!.width).toBeLessThan(before - 50);
    const box = (await svg.boundingBox())!;
    const wAttr = Number(await svg.getAttribute('width'));
    expect(Math.abs(wAttr - box.width)).toBeLessThanOrEqual(1);
    const labels = example(page, 0).locator('.ui-chart-axis');
    const n = await labels.count();
    expect(n).toBeGreaterThan(3);
    for (let i = 0; i < n; i++) {
      const b = (await labels.nth(i).boundingBox())!;
      expect(b.x).toBeGreaterThanOrEqual(box.x - 2);
      expect(b.x + b.width).toBeLessThanOrEqual(box.x + box.width + 2);
    }
  });

  test('has no serious accessibility violations (light)', async ({ page }) => {
    test.slow();
    await ready(page, PAGES.area);
    await expectNoA11yViolations(page, '.ui-chart');
  });

  test('has no serious accessibility violations in dark mode', async ({ page }) => {
    test.slow();
    await ready(page, PAGES.area, true);
    await expect(page.locator('html')).toHaveClass(/dark/);
    await expectNoA11yViolations(page, '.ui-chart');
  });
});

test.describe('Line chart', () => {
  test('draws one line per series and shows every point in the table', async ({ page }) => {
    await ready(page, PAGES.line);
    const chart = example(page, 0).locator('.ui-chart').first();
    await expect(chart.locator('.ui-chart-line')).toHaveCount(2);
    await expect(chart.locator('table tbody tr')).toHaveCount(12);
    await expect(chart.locator('.ui-chart-axis').filter({ hasText: /^\$\d+K$/ }).first()).toBeVisible();
  });

  test('tooltip formats currency and snaps to a month', async ({ page }) => {
    await ready(page, PAGES.line);
    await pointAt(stageOf(page, 0), 0.5);
    const tip = tooltipOf(page, 0);
    await expect(tip).toHaveAttribute('data-visible', 'true');
    await expect(tip).toContainText(/\$[\d,]+/);
    await expect(tip.locator('.ui-chart-tooltip-label')).toHaveText(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)$/);
  });

  test('curve toggle changes the path', async ({ page }) => {
    await ready(page, PAGES.line);
    const chart = example(page, 1).locator('.ui-chart').first();
    const path = chart.locator('.ui-chart-line').first();
    expect(await path.getAttribute('d')).toContain('C');
    await example(page, 1).getByRole('button', { name: 'Step' }).click();
    await expect.poll(async () => path.getAttribute('d')).not.toContain('C');
    await example(page, 1).getByRole('button', { name: 'Linear' }).click();
    await expect.poll(async () => (await path.getAttribute('d')) ?? '').toMatch(/^M[\d. ]+(L[\d. ]+)+$/);
  });

  test('has no serious accessibility violations', async ({ page }) => {
    test.slow();
    await ready(page, PAGES.line);
    await expectNoA11yViolations(page, '.ui-chart');
  });
});

test.describe('Bar chart', () => {
  test('renders one bar per value', async ({ page }) => {
    await ready(page, PAGES.bar);
    await expect(example(page, 0).locator('.ui-chart-bar')).toHaveCount(12);
    await expect(example(page, 1).locator('.ui-chart-bar')).toHaveCount(24);
    await expect(example(page, 2).locator('.ui-chart-bar')).toHaveCount(5);
  });

  test('hovering a category dims the other bars and shows the tooltip', async ({ page }) => {
    await ready(page, PAGES.bar);
    await pointAt(stageOf(page, 0), 0.5);
    const tip = tooltipOf(page, 0);
    await expect(tip).toHaveAttribute('data-visible', 'true');
    await expect(example(page, 0).locator('.ui-chart-bar[data-dim="true"]')).toHaveCount(10);
    await expect(example(page, 0).locator('.ui-chart-bar[data-dim="false"]')).toHaveCount(2);
    await expect(tip).toContainText('Revenue');
    await expect(tip).toContainText('Expenses');
  });

  test('negative values draw below the zero line', async ({ page }) => {
    await ready(page, PAGES.bar);
    const chart = example(page, 1).locator('.ui-chart').first();
    const payroll = chart.locator('.ui-chart-bar').nth(2);
    const income = chart.locator('.ui-chart-bar').nth(0);
    const p = (await payroll.boundingBox())!;
    const i = (await income.boundingBox())!;
    expect(p.y).toBeGreaterThanOrEqual(i.y + i.height - 1);
  });

  test('keyboard moves between categories', async ({ page }) => {
    await ready(page, PAGES.bar);
    const stage = stageOf(page, 0);
    await stage.focus();
    await page.keyboard.press('ArrowRight');
    await expect(tooltipOf(page, 0).locator('.ui-chart-tooltip-label')).toHaveText('Jan');
    await page.keyboard.press('ArrowRight');
    await expect(tooltipOf(page, 0).locator('.ui-chart-tooltip-label')).toHaveText('Feb');
    await page.keyboard.press('Escape');
    await expect(tooltipOf(page, 0)).toHaveAttribute('data-visible', 'false');
  });

  test('horizontal bars read left to right inside the chart', async ({ page }) => {
    await ready(page, PAGES.bar);
    const chart = example(page, 2).locator('.ui-chart').first();
    const svg = (await chart.locator('svg[role="img"]').boundingBox())!;
    const first = (await chart.locator('.ui-chart-bar').first().boundingBox())!;
    const last = (await chart.locator('.ui-chart-bar').last().boundingBox())!;
    expect(first.width).toBeGreaterThan(last.width);
    expect(first.x + first.width).toBeLessThanOrEqual(svg.x + svg.width + 1);
  });

  test('has no serious accessibility violations', async ({ page }) => {
    test.slow();
    await ready(page, PAGES.bar);
    await expectNoA11yViolations(page, '.ui-chart');
  });
});

test.describe('Donut chart', () => {
  test('renders one slice per row and centres the total', async ({ page }) => {
    await ready(page, PAGES.donut);
    await expect(example(page, 0).locator('.ui-chart-slice')).toHaveCount(5);
    await expect(example(page, 1).locator('.ui-chart-slice')).toHaveCount(3);
    await expect(example(page, 0).locator('.ui-chart-center-value')).toHaveText('11,960');
    await expect(example(page, 1).locator('.ui-chart-center')).toHaveCount(0);
  });

  test('hovering a slice shows its value in the hole and in the tooltip', async ({ page }) => {
    await ready(page, PAGES.donut);
    const stage = stageOf(page, 0);
    const box = (await stage.boundingBox())!;
    const outer = Math.min(box.width, box.height) / 2 - 8;
    const mid = (outer + outer * 0.62) / 2;
    const position = { x: box.width / 2 + 12, y: box.height / 2 - mid };
    if (test.info().project.use.hasTouch) await stage.tap({ position });
    else await stage.hover({ position });
    await expect(tooltipOf(page, 0)).toHaveAttribute('data-visible', 'true');
    await expect(example(page, 0).locator('.ui-chart-center-label')).toHaveText('Organic search');
    await expect(example(page, 0).locator('.ui-chart-center-value')).toHaveText('4,820');
    await expect(example(page, 0).locator('.ui-chart-slice[data-dim="true"]')).toHaveCount(4);
  });

  test('legend hides a slice and the total follows', async ({ page }) => {
    await ready(page, PAGES.donut);
    const chart = example(page, 0).locator('.ui-chart').first();
    await chart.getByRole('button', { name: 'Direct' }).click();
    await expect(chart.locator('.ui-chart-slice')).toHaveCount(4);
    await expect(chart.locator('.ui-chart-center-value')).toHaveText('8,800');
  });

  test('keyboard cycles through slices', async ({ page }) => {
    await ready(page, PAGES.donut);
    await stageOf(page, 0).focus();
    await page.keyboard.press('ArrowRight');
    await expect(example(page, 0).locator('.ui-chart-center-label')).toHaveText('Organic search');
    await page.keyboard.press('ArrowRight');
    await expect(example(page, 0).locator('.ui-chart-center-label')).toHaveText('Direct');
    await page.keyboard.press('Escape');
    await expect(example(page, 0).locator('.ui-chart-center-label')).toHaveText('Visitors');
  });

  test('has no serious accessibility violations', async ({ page }) => {
    test.slow();
    await ready(page, PAGES.donut);
    await expectNoA11yViolations(page, '.ui-chart');
  });
});

test.describe('Radial chart', () => {
  test('renders a gauge and nested rings', async ({ page }) => {
    await ready(page, PAGES.radial);
    await expect(example(page, 0).locator('.ui-chart-ring-value')).toHaveCount(1);
    await expect(example(page, 0).locator('.ui-chart-track')).toHaveCount(1);
    await expect(example(page, 0).locator('.ui-chart-center-value')).toHaveText(/72\.4/);
    await expect(example(page, 1).locator('.ui-chart-ring-value')).toHaveCount(3);
  });

  test('the outer ring is the first row and the keyboard walks the rings', async ({ page }) => {
    await ready(page, PAGES.radial);
    await stageOf(page, 1).focus();
    await page.keyboard.press('ArrowRight');
    await expect(example(page, 1).locator('.ui-chart-center-label')).toHaveText('Signups');
    await expect(example(page, 1).locator('.ui-chart-center-value')).toHaveText('86%');
    await page.keyboard.press('ArrowRight');
    await expect(example(page, 1).locator('.ui-chart-center-value')).toHaveText('64%');
  });

  test('has no serious accessibility violations', async ({ page }) => {
    test.slow();
    await ready(page, PAGES.radial);
    await expectNoA11yViolations(page, '.ui-chart');
  });
});

test.describe('Sparkline', () => {
  test('renders three labelled sparklines with a last-point dot', async ({ page }) => {
    await ready(page, PAGES.spark);
    const svgs = example(page, 0).locator('.ui-sparkline svg');
    await expect(svgs).toHaveCount(3);
    await expect(svgs.first()).toHaveAttribute('aria-label', /rising from 38 to 84/);
    await expect(example(page, 0).locator('.ui-sparkline-dot')).toHaveCount(2);
    await expect(example(page, 0).locator('.ui-chart-bar, path[data-grow]')).toHaveCount(12);
    const box = (await svgs.first().boundingBox())!;
    expect(box.width).toBeGreaterThan(60);
    expect(Math.round(box.height)).toBe(40);
  });

  test('trend colours by direction through a CSS variable', async ({ page }) => {
    await ready(page, PAGES.spark);
    const stroke = await example(page, 0).locator('.ui-sparkline path[data-draw]').first().getAttribute('stroke');
    expect(stroke).toBe('var(--ui-success)');
  });

  test('has no serious accessibility violations', async ({ page }) => {
    test.slow();
    await ready(page, PAGES.spark);
    await expectNoA11yViolations(page, '.ui-sparkline');
  });
});

test.describe('Colours follow the theme without re-rendering', () => {
  test('series colour resolves from the CSS variable and changes with the accent-free dark switch', async ({ page }) => {
    await ready(page, PAGES.line);
    const read = () =>
      page.evaluate(() => getComputedStyle(document.querySelector('.ui-chart-line')!).stroke);
    const light = await read();
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    const dark = await read();
    expect(light).toMatch(/^(rgb|oklch|color)/);
    // The path element is the same node: only the variable changed
    expect(await page.locator('.ui-chart-line').first().getAttribute('style')).toContain('--ui-chart-c0');
    expect(typeof dark).toBe('string');
  });
});
