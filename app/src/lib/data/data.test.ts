import { describe, it, expect } from 'vitest';
import { getFallbackCompetitive, getFallbackSocial, getFallbackMarket } from './fallback.js';

describe('getFallbackCompetitive', () => {
	it('returns data for the requested brand', () => {
		const data = getFallbackCompetitive('Nike');
		expect(data.brand).toBe('Nike');
	});

	it('includes competitor entries with required fields', () => {
		const data = getFallbackCompetitive('Figma');
		expect(data.competitors.length).toBeGreaterThan(0);
		for (const c of data.competitors) {
			expect(c.name).toBeTruthy();
			expect(c.positioning).toBeTruthy();
			expect(c.strengths.length).toBeGreaterThan(0);
			expect(c.weaknesses.length).toBeGreaterThan(0);
			expect(c.marketShare).toBeTruthy();
		}
	});

	it('includes sources and fetchedAt timestamp', () => {
		const data = getFallbackCompetitive('Test');
		expect(data.sources).toContain('fallback-demo-data');
		expect(new Date(data.fetchedAt).getTime()).not.toBeNaN();
	});

	it('uses the brand parameter, not hardcoded brand', () => {
		const data = getFallbackCompetitive('CustomBrand');
		expect(data.brand).toBe('CustomBrand');
	});
});

describe('getFallbackSocial', () => {
	it('returns data for the requested brand', () => {
		const data = getFallbackSocial('Notion');
		expect(data.brand).toBe('Notion');
	});

	it('has valid sentiment values summing to ~1.0', () => {
		const data = getFallbackSocial('Test');
		const sum = data.sentiment.positive + data.sentiment.neutral + data.sentiment.negative;
		expect(sum).toBeCloseTo(1.0, 1);
	});

	it('includes themes and volume', () => {
		const data = getFallbackSocial('Test');
		expect(data.themes.length).toBeGreaterThan(0);
		expect(data.volume).toBeGreaterThan(0);
	});

	it('includes sources and fetchedAt', () => {
		const data = getFallbackSocial('Test');
		expect(data.sources).toContain('fallback-demo-data');
		expect(new Date(data.fetchedAt).getTime()).not.toBeNaN();
	});
});

describe('getFallbackMarket', () => {
	it('returns data for the requested industry', () => {
		const data = getFallbackMarket('SaaS');
		expect(data.industry).toBe('SaaS');
	});

	it('includes market size and growth rate', () => {
		const data = getFallbackMarket('Fintech');
		expect(data.marketSize).toBeTruthy();
		expect(data.growthRate).toBeTruthy();
	});

	it('includes trends and key players', () => {
		const data = getFallbackMarket('Test');
		expect(data.trends.length).toBeGreaterThan(0);
		expect(data.keyPlayers.length).toBeGreaterThan(0);
	});

	it('uses the industry parameter, not hardcoded industry', () => {
		const data = getFallbackMarket('AI Infrastructure');
		expect(data.industry).toBe('AI Infrastructure');
	});

	it('includes sources and fetchedAt', () => {
		const data = getFallbackMarket('Test');
		expect(data.sources).toContain('fallback-demo-data');
		expect(new Date(data.fetchedAt).getTime()).not.toBeNaN();
	});
});
