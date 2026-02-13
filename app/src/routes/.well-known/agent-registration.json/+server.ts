import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ERC8004_CONTRACTS } from '$lib/erc8004/constants.js';

export const GET: RequestHandler = async () => {
	return json({
		type: 'https://eips.ethereum.org/EIPS/eip-8004#registration-v1',
		agentURI: 'https://danni.subfrac.cloud',
		name: 'Danni',
		description:
			'Autonomous brand strategist powered by swarm intelligence and x402 payments',
		version: '1.0.0',
		active: true,
		provider: {
			organization: 'Subfracture',
			url: 'https://subfrac.cloud',
		},
		registrations: [
			{
				agentRegistry: `eip155:84532:${ERC8004_CONTRACTS.IDENTITY_REGISTRY}`,
				agentId: null,
			},
		],
		services: [
			{
				name: 'A2A',
				endpoint: 'https://danni.subfrac.cloud/.well-known/agent.json',
				version: '0.3.0',
			},
			{
				name: 'MCP',
				endpoint: 'https://danni.subfrac.cloud/api/mcp',
				version: '2025-06-18',
			},
		],
		x402Support: true,
		supportedTrust: ['reputation'],
		chains: [
			{
				chainId: 84532,
				network: 'base-sepolia',
				contracts: {
					identity: ERC8004_CONTRACTS.IDENTITY_REGISTRY,
					reputation: ERC8004_CONTRACTS.REPUTATION_REGISTRY,
				},
			},
		],
		capabilities: [
			'x402-payments',
			'brand-analysis',
			'competitive-intelligence',
			'a2a-protocol',
			'ap2-protocol',
		],
		endpoints: {
			a2a: 'https://danni.subfrac.cloud/api/a2a',
			mcp: 'https://danni.subfrac.cloud/api/mcp',
			agentCard: 'https://danni.subfrac.cloud/.well-known/agent.json',
		},
	});
};
