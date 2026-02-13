import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * GET /.well-known/agent.json
 * A2A Agent Card - Phase 5 (Agent Interop) will finalize.
 */
export const GET: RequestHandler = async () => {
	return json({
		name: 'Danni',
		description: 'Autonomous brand strategist powered by swarm intelligence',
		url: 'https://danni.subfrac.cloud',
		version: '1.0.0',
		capabilities: {
			streaming: true,
			pushNotifications: false
		},
		skills: [
			{
				id: 'brand-analysis',
				name: 'Strategic Brand Analysis',
				description: 'Premium brand strategy from 5 parallel AI analysts',
				inputModes: ['text/plain'],
				outputModes: ['text/plain', 'application/json']
			}
		],
		authentication: {
			schemes: ['x402']
		},
		pricing: {
			'brand-analysis': {
				amount: '$100',
				network: 'eip155:84532',
				asset: 'USDC'
			}
		}
	});
};
