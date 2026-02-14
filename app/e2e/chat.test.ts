import { test, expect } from '@playwright/test';

test.describe('Chat Page', () => {
	test('renders empty state with prompt text', async ({ page }) => {
		await page.goto('/chat');
		const emptyState = page.locator('.empty-state');
		await expect(emptyState).toBeVisible();
		await expect(emptyState.locator('h2')).toHaveText('What intrigues me most...');
	});

	test('has textarea for brand input', async ({ page }) => {
		await page.goto('/chat');
		const textarea = page.locator('textarea');
		await expect(textarea).toBeVisible();
		await expect(textarea).toHaveAttribute('placeholder', 'Describe your brand challenge...');
	});

	test('shows Connect Wallet button when wallet not connected', async ({ page }) => {
		await page.goto('/chat');
		const walletBtn = page.locator('.wallet-btn');
		await expect(walletBtn).toBeVisible();
		await expect(walletBtn).toContainText('Connect Wallet');
	});

	test('shows wallet connection hint', async ({ page }) => {
		await page.goto('/chat');
		const hint = page.locator('.input-hint');
		await expect(hint).toContainText('Connect your wallet to pay $100 USDC');
	});

	test('page title is correct', async ({ page }) => {
		await page.goto('/chat');
		await expect(page).toHaveTitle('Danni - Chat');
	});

	test('sidebar contains economics card', async ({ page }) => {
		await page.goto('/chat');
		const economics = page.locator('.economics-card');
		await expect(economics).toBeVisible();
		await expect(economics.locator('h3')).toHaveText('Economics');
	});

	test('economics shows correct pricing', async ({ page }) => {
		await page.goto('/chat');
		const total = page.locator('.economics-line.total .value');
		await expect(total).toHaveText('$115 USDC');
	});

	test('economics shows network info', async ({ page }) => {
		await page.goto('/chat');
		const network = page.locator('.economics-network');
		await expect(network).toContainText('Base Sepolia');
	});

	test('powered by text is visible in empty state', async ({ page }) => {
		await page.goto('/chat');
		const poweredBy = page.locator('.powered-by');
		await expect(poweredBy).toContainText('Powered by x402');
	});

	test('sidebar has payment and swarm viz sections', async ({ page }) => {
		await page.goto('/chat');
		const sidebar = page.locator('aside.sidebar');
		await expect(sidebar).toBeVisible();
	});
});
