import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PRICING, NETWORKS, USDC, FACILITATORS } from '$lib/config/index.js';

export const GET: RequestHandler = async () => {
	return json({
		name: 'Danni',
		description: 'Autonomous brand strategist powered by swarm intelligence. Five parallel AI analysts produce market positioning, competitive intelligence, cultural resonance, and brand architecture synthesized into actionable strategy.',
		version: '1.0.0',
		provider: {
			organization: 'Subfracture',
			url: 'https://subfrac.cloud',
		},
		capabilities: {
			streaming: false,
			pushNotifications: false,
			extensions: [
				{
					uri: 'https://github.com/google-a2a/a2a-x402/v0.1',
					description: 'Supports payments using the x402 protocol for on-chain USDC settlement on Base Sepolia.',
					required: true,
				},
			],
		},
		defaultInputModes: ['text/plain', 'application/json'],
		defaultOutputModes: ['text/plain', 'application/json'],
		skills: [
			{
				id: 'brand-analysis',
				name: 'Strategic Brand Analysis',
				description: 'Premium brand strategy from 5 parallel AI analysts — market positioning, competitive intelligence, cultural resonance, and brand architecture synthesized into actionable strategy.',
				tags: ['brand', 'strategy', 'analysis', 'market', 'competitive', 'x402'],
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
				tags: ['competitive', 'intelligence', 'scan', 'market-share', 'x402'],
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
				tags: ['market', 'trends', 'industry', 'dynamics', 'x402'],
				examples: [
					'What are the market dynamics for AI-powered SaaS in 2026?',
				],
				inputModes: ['application/json'],
				outputModes: ['application/json'],
			},
		],
		securitySchemes: {
			x402: {
				type: 'x402',
				description: 'x402 payment protocol — EIP-3009 USDC authorization on Base Sepolia',
				network: NETWORKS.BASE_SEPOLIA,
				asset: USDC.BASE_SEPOLIA,
				facilitator: FACILITATORS.DEFAULT,
			},
		},
		security: [{ x402: [] }],
		x402: {
			network: NETWORKS.BASE_SEPOLIA,
			asset: USDC.BASE_SEPOLIA,
			facilitator: FACILITATORS.DEFAULT,
			pricing: {
				'brand-analysis': PRICING.BRAND_ANALYSIS,
				'competitive-scan': PRICING.DATA_ENDPOINT,
				'market-pulse': PRICING.DATA_ENDPOINT,
			},
		},
		supportedInterfaces: [
			{
				url: 'https://danni.subfrac.cloud/api/a2a',
				protocolBinding: 'JSONRPC',
				protocolVersion: '0.3',
			},
		],
	});
};
