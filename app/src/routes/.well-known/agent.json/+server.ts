import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PRICING, NETWORKS, USDC, FACILITATORS } from '$lib/config/index.js';

export const GET: RequestHandler = async () => {
	return json({
		name: 'Danni',
		description: 'Autonomous brand strategist powered by swarm intelligence. Five parallel AI analysts produce market positioning, competitive intelligence, cultural resonance, and brand architecture.',
		url: 'https://danni.subfrac.cloud',
		version: '1.0.0',
		provider: {
			organization: 'Subfracture',
			url: 'https://subfrac.cloud',
		},
		capabilities: {
			streaming: true,
			pushNotifications: false,
		},
		defaultInputModes: ['text/plain', 'application/json'],
		defaultOutputModes: ['text/plain', 'application/json'],
		skills: [
			{
				id: 'brand-analysis',
				name: 'Strategic Brand Analysis',
				description: 'Premium brand strategy from 5 parallel AI analysts — market positioning, competitive intelligence, cultural resonance, and brand architecture synthesized into actionable strategy.',
				tags: ['brand', 'strategy', 'analysis', 'market', 'competitive'],
				examples: [
					'Analyze the brand positioning of Notion in the productivity space',
					'What strategic opportunities exist for a new DTC skincare brand targeting Gen Z?',
				],
				inputModes: ['text/plain', 'application/json'],
				outputModes: ['text/plain', 'application/json'],
			},
			{
				id: 'competitive-scan',
				name: 'Competitive Landscape Scan',
				description: 'Quick competitive intelligence scan — identifies competitor positioning, strengths, weaknesses, and market share for a given brand.',
				tags: ['competitive', 'intelligence', 'scan', 'market-share'],
				examples: [
					'Scan competitors for Figma in the design tools market',
				],
				inputModes: ['application/json'],
				outputModes: ['application/json'],
			},
			{
				id: 'market-pulse',
				name: 'Market Pulse',
				description: 'Industry market dynamics overview — market size, growth rate, emerging trends, and key players for a given industry segment.',
				tags: ['market', 'trends', 'industry', 'dynamics'],
				examples: [
					'What are the market dynamics for AI-powered SaaS in 2026?',
				],
				inputModes: ['application/json'],
				outputModes: ['application/json'],
			},
		],
		authentication: {
			schemes: ['x402'],
			x402: {
				network: NETWORKS.BASE_SEPOLIA,
				asset: USDC.BASE_SEPOLIA,
				facilitator: FACILITATORS.DEFAULT,
			},
		},
		pricing: {
			'brand-analysis': {
				amount: PRICING.BRAND_ANALYSIS,
				network: NETWORKS.BASE_SEPOLIA,
				asset: 'USDC',
			},
			'competitive-scan': {
				amount: PRICING.DATA_ENDPOINT,
				network: NETWORKS.BASE_SEPOLIA,
				asset: 'USDC',
			},
			'market-pulse': {
				amount: PRICING.DATA_ENDPOINT,
				network: NETWORKS.BASE_SEPOLIA,
				asset: 'USDC',
			},
		},
		supportedInterfaces: [
			{
				url: 'https://danni.subfrac.cloud/api/a2a',
				protocolBinding: 'JSONRPC',
				protocolVersion: '1.0',
			},
		],
	});
};
