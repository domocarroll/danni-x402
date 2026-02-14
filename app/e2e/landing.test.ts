import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
	test('renders hero section with Danni wordmark', async ({ page }) => {
		await page.goto('/');
		const wordmark = page.locator('.wordmark');
		await expect(wordmark).toBeVisible();
		await expect(wordmark).toHaveText('Danni');
	});

	test('renders acronym', async ({ page }) => {
		await page.goto('/');
		const acronym = page.locator('.acronym');
		await expect(acronym).toBeVisible();
		await expect(acronym).toContainText('Dedicated Autonomous Neural Networked Intelligence');
	});

	test('renders three pricing tiers', async ({ page }) => {
		await page.goto('/');
		const cards = page.locator('.pricing-card');
		await expect(cards).toHaveCount(3);

		await expect(page.locator('.tier-name').first()).toHaveText('Pulse');
		await expect(page.locator('.tier-name').nth(1)).toHaveText('Deep Dive');
		await expect(page.locator('.tier-name').nth(2)).toHaveText('Masterwork');
	});

	test('pricing amounts are correct', async ({ page }) => {
		await page.goto('/');
		const amounts = page.locator('.amount');
		await expect(amounts.first()).toHaveText('$100');
		await expect(amounts.nth(1)).toHaveText('$1,000');
		await expect(amounts.nth(2)).toHaveText('$50,000');
	});

	test('Deep Dive card has featured class and "Most Popular" badge', async ({ page }) => {
		await page.goto('/');
		const featured = page.locator('.pricing-card.featured');
		await expect(featured).toBeVisible();
		await expect(page.locator('.popular-badge')).toHaveText('Most Popular');
	});

	test('Masterwork card has "Statement Piece" badge', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('.statement-badge')).toHaveText('Statement Piece');
	});

	test('all CTA links navigate to /chat', async ({ page }) => {
		await page.goto('/');
		const ctaLinks = page.locator('.tier-cta');
		await expect(ctaLinks).toHaveCount(3);

		for (let i = 0; i < 3; i++) {
			await expect(ctaLinks.nth(i)).toHaveAttribute('href', '/chat');
		}
	});

	test('Danni quote is visible', async ({ page }) => {
		await page.goto('/');
		const quote = page.locator('.danni-quote blockquote');
		await expect(quote).toContainText('brands that endure');
	});

	test('three feature cards are rendered', async ({ page }) => {
		await page.goto('/');
		const features = page.locator('.feature-card');
		await expect(features).toHaveCount(3);

		await expect(features.nth(0).locator('h3')).toHaveText('Parallel Intelligence');
		await expect(features.nth(1).locator('h3')).toHaveText('Real Market Data');
		await expect(features.nth(2).locator('h3')).toHaveText('Glass Box');
	});

	test('How It Works section has 3 steps', async ({ page }) => {
		await page.goto('/');
		const steps = page.locator('.step');
		await expect(steps).toHaveCount(3);

		await expect(steps.nth(0).locator('h3')).toHaveText('Submit Your Brief');
		await expect(steps.nth(1).locator('h3')).toHaveText('Swarm Analyzes');
		await expect(steps.nth(2).locator('h3')).toHaveText('Get Strategy');
	});

	test('footer CTA links to /chat', async ({ page }) => {
		await page.goto('/');
		const cta = page.locator('.footer-cta .cta');
		await expect(cta).toHaveAttribute('href', '/chat');
		await expect(cta).toHaveText('Begin Analysis');
	});

	test('page title is correct', async ({ page }) => {
		await page.goto('/');
		await expect(page).toHaveTitle('Danni - Autonomous Brand Strategist');
	});

	test('meta description is set', async ({ page }) => {
		await page.goto('/');
		const desc = page.locator('meta[name="description"]');
		await expect(desc).toHaveAttribute('content', /x402-powered AI brand strategy/);
	});
});
