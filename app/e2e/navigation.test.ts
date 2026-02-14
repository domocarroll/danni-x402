import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
	test('nav bar is visible with correct links', async ({ page }) => {
		await page.goto('/');
		const nav = page.locator('nav');
		await expect(nav).toBeVisible();

		await expect(page.locator('.nav-brand')).toHaveText('Danni');
		await expect(page.locator('.nav-links a')).toHaveCount(4);
	});

	test('nav links point to correct routes', async ({ page }) => {
		await page.goto('/');
		const links = page.locator('.nav-links a');

		await expect(links.nth(0)).toHaveAttribute('href', '/');
		await expect(links.nth(1)).toHaveAttribute('href', '/chat');
		await expect(links.nth(2)).toHaveAttribute('href', '/dashboard');
		await expect(links.nth(3)).toHaveAttribute('href', '/graph');
	});

	test('active link is highlighted on home page', async ({ page }) => {
		await page.goto('/');
		const homeLink = page.locator('.nav-links a[href="/"]');
		await expect(homeLink).toHaveClass(/active/);
	});

	test('navigating to chat page updates active link', async ({ page }) => {
		await page.goto('/chat');
		const chatLink = page.locator('.nav-links a[href="/chat"]');
		await expect(chatLink).toHaveClass(/active/);
	});

	test('navigating to dashboard page updates active link', async ({ page }) => {
		await page.goto('/dashboard');
		const dashLink = page.locator('.nav-links a[href="/dashboard"]');
		await expect(dashLink).toHaveClass(/active/);
	});

	test('wallet status shows Base Sepolia', async ({ page }) => {
		await page.goto('/');
		const status = page.locator('.wallet-status');
		await expect(status).toContainText('Base Sepolia');
	});

	test('brand link navigates home', async ({ page }) => {
		await page.goto('/chat');
		await page.locator('.nav-brand').click();
		await expect(page).toHaveURL('/');
	});

	test('clicking Chat navigates to /chat', async ({ page }) => {
		await page.goto('/');
		await page.locator('.nav-links a[href="/chat"]').click();
		await expect(page).toHaveURL('/chat');
	});

	test('clicking Dashboard navigates to /dashboard', async ({ page }) => {
		await page.goto('/');
		await page.locator('.nav-links a[href="/dashboard"]').click();
		await expect(page).toHaveURL('/dashboard');
	});
});
