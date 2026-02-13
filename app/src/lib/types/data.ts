/** Competitive analysis response from Data Broker */
export interface CompetitiveData {
	brand: string;
	competitors: Array<{
		name: string;
		positioning: string;
		strengths: string[];
		weaknesses: string[];
		marketShare?: string;
	}>;
	sources: string[];
	fetchedAt: string;
}

/** Social sentiment response from Data Broker */
export interface SocialData {
	brand: string;
	sentiment: { positive: number; neutral: number; negative: number };
	themes: string[];
	volume: number;
	sources: string[];
	fetchedAt: string;
}

/** Market dynamics response from Data Broker */
export interface MarketData {
	industry: string;
	marketSize: string;
	growthRate: string;
	trends: string[];
	keyPlayers: string[];
	sources: string[];
	fetchedAt: string;
}
