import type { CompetitiveData, SocialData, MarketData } from '$lib/types';

export function getFallbackCompetitive(brand: string): CompetitiveData {
	return {
		brand,
		competitors: [
			{
				name: 'Adidas',
				positioning: 'Performance-driven sportswear with European design heritage',
				strengths: ['Strong soccer/football presence', 'Sustainability initiatives', 'Boost technology'],
				weaknesses: ['Weaker North American market share', 'Less cultural cache than Nike'],
				marketShare: '15.4%'
			},
			{
				name: 'New Balance',
				positioning: 'Heritage craftsmanship meets modern performance',
				strengths: ['Made in USA line', 'Growing cultural relevance', 'Dad shoe trend leader'],
				weaknesses: ['Smaller marketing budget', 'Limited athlete endorsements'],
				marketShare: '6.2%'
			},
			{
				name: 'Puma',
				positioning: 'Sport-lifestyle fusion with fashion-forward edge',
				strengths: ['Celebrity partnerships', 'Competitive pricing', 'Strong motorsport ties'],
				weaknesses: ['Brand identity confusion', 'Lower premium perception'],
				marketShare: '5.1%'
			},
			{
				name: 'Under Armour',
				positioning: 'Technology-first performance athletic wear',
				strengths: ['Performance fabric innovation', 'Strong US presence', 'Digital fitness ecosystem'],
				weaknesses: ['Declining brand heat', 'Overexposure in discount channels'],
				marketShare: '4.8%'
			}
		],
		sources: ['fallback-demo-data'],
		fetchedAt: new Date().toISOString()
	};
}

export function getFallbackSocial(brand: string): SocialData {
	return {
		brand,
		sentiment: { positive: 0.62, neutral: 0.24, negative: 0.14 },
		themes: [
			'Just Do It campaign resonance',
			'Sustainability criticism vs progress',
			'Air Max Day hype',
			'Athlete endorsement controversies',
			'DTC strategy shift',
			'Sneaker culture and resale market'
		],
		volume: 284000,
		sources: ['fallback-demo-data'],
		fetchedAt: new Date().toISOString()
	};
}

export function getFallbackMarket(industry: string): MarketData {
	return {
		industry,
		marketSize: '$384.2 billion (2025)',
		growthRate: '5.7% CAGR (2025-2030)',
		trends: [
			'Direct-to-consumer acceleration',
			'Sustainability and circular economy',
			'Athleisure crossover into daily wear',
			'AI-driven personalization',
			'Resale and recommerce platforms',
			'Performance fabrics in casual wear'
		],
		keyPlayers: ['Nike', 'Adidas', 'New Balance', 'Puma', 'Under Armour', 'ASICS', 'Lululemon'],
		sources: ['fallback-demo-data'],
		fetchedAt: new Date().toISOString()
	};
}
