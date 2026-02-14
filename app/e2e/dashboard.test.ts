import { test, expect } from '@playwright/test';

test.describe('Dashboard Page', () => {
	test('renders dashboard header', async ({ page }) => {
		await page.goto('/dashboard');
		await expect(page.locator('.dash-header h1')).toHaveText('Payment Dashboard');
	});

	test('shows subtitle with Base Sepolia', async ({ page }) => {
		await page.goto('/dashboard');
		await expect(page.locator('.dash-subtitle')).toHaveText('Transaction history on Base Sepolia');
	});

	test('page title is correct', async ({ page }) => {
		await page.goto('/dashboard');
		await expect(page).toHaveTitle('Danni - Dashboard');
	});

	test('shows 4 stat cards', async ({ page }) => {
		await page.goto('/dashboard');
		const statCards = page.locator('.stat-card');
		await expect(statCards).toHaveCount(4);
	});

	test('stat labels are correct', async ({ page }) => {
		await page.goto('/dashboard');
		const labels = page.locator('.stat-label');
		await expect(labels.nth(0)).toHaveText('Total Spent');
		await expect(labels.nth(1)).toHaveText('Analyses');
		await expect(labels.nth(2)).toHaveText('Transactions');
		await expect(labels.nth(3)).toHaveText('Avg per Tx');
	});

	test('empty state is shown when no transactions', async ({ page }) => {
		await page.goto('/dashboard');
		const empty = page.locator('.empty-state');
		await expect(empty).toBeVisible();
		await expect(empty.locator('h2')).toHaveText('No analyses yet');
	});

	test('empty state has CTA to chat', async ({ page }) => {
		await page.goto('/dashboard');
		const cta = page.locator('.empty-cta');
		await expect(cta).toHaveText('Go to Chat');
		await expect(cta).toHaveAttribute('href', '/chat');
	});

	test('clicking Go to Chat navigates to /chat', async ({ page }) => {
		await page.goto('/dashboard');
		await page.locator('.empty-cta').click();
		await expect(page).toHaveURL('/chat');
	});
});
