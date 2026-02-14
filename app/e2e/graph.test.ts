import { test, expect } from '@playwright/test';

test.describe('Graph Page', () => {
	test('renders graph page with container', async ({ page }) => {
		await page.goto('/graph');
		const container = page.locator('.graph-page');
		await expect(container).toBeVisible();
	});

	test('page title is correct', async ({ page }) => {
		await page.goto('/graph');
		await expect(page).toHaveTitle('Swarm Graph - Danni');
	});

	test('legend is visible with swarm topology title', async ({ page }) => {
		await page.goto('/graph');
		const legend = page.locator('.legend');
		await expect(legend).toBeVisible();
		await expect(page.locator('.legend-title')).toHaveText('Swarm Topology');
	});

	test('legend shows Nike Analysis brand', async ({ page }) => {
		await page.goto('/graph');
		await expect(page.locator('.legend-brand')).toHaveText('Nike Analysis');
	});

	test('legend has 6 colored items', async ({ page }) => {
		await page.goto('/graph');
		const dots = page.locator('.legend-dot');
		await expect(dots).toHaveCount(6);
	});

	test('legend has link type indicators', async ({ page }) => {
		await page.goto('/graph');
		await expect(page.locator('.legend-line.solid')).toBeVisible();
		await expect(page.locator('.legend-line.dashed')).toBeVisible();
	});

	test('legend shows click hint', async ({ page }) => {
		await page.goto('/graph');
		await expect(page.locator('.legend-hint')).toHaveText('Click a node to focus');
	});

	test('graph container fills viewport', async ({ page }) => {
		await page.goto('/graph');
		const container = page.locator('.graph-container');
		const box = await container.boundingBox();
		expect(box).not.toBeNull();
		expect(box!.width).toBeGreaterThan(500);
		expect(box!.height).toBeGreaterThan(300);
	});
});
