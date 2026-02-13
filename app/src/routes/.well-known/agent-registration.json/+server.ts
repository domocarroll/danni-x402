import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const ERC8004_CONTRACTS = {
	IDENTITY_REGISTRY: '0x8004A818BFB912233c491871b3d84c89A494BD9e',
	REPUTATION_REGISTRY: '0x8004B663056A597Dffe9eCcC1965A193B7388713',
};

export const GET: RequestHandler = async () => {
	return json({
		type: 'https://eips.ethereum.org/EIPS/eip-8004#registration-v1',
		agentURI: 'https://danni.subfrac.cloud',
		name: 'Danni',
		description:
			'Autonomous brand strategist powered by swarm intelligence and x402 payments',
		version: '1.0.0',
		provider: {
			organization: 'Subfracture',
			url: 'https://subfrac.cloud',
		},
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
