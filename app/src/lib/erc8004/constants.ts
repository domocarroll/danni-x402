export const ERC8004_CONTRACTS = {
	IDENTITY_REGISTRY: '0x8004A818BFB912233c491871b3d84c89A494BD9e',
	REPUTATION_REGISTRY: '0x8004B663056A597Dffe9eCcC1965A193B7388713',
	VALIDATION_REGISTRY: '0x8004CB39f29c09145F24Ad9dDe2A108C1A2cdfC5',
} as const;

export const IDENTITY_REGISTRY_ABI = [
	{
		name: 'register',
		type: 'function',
		stateMutability: 'nonpayable',
		inputs: [{ name: 'agentURI', type: 'string' }],
		outputs: [{ name: 'agentId', type: 'uint256' }],
	},
	{
		name: 'getAgentId',
		type: 'function',
		stateMutability: 'view',
		inputs: [{ name: 'agentURI', type: 'string' }],
		outputs: [{ name: '', type: 'uint256' }],
	},
] as const;

export const REPUTATION_REGISTRY_ABI = [
	{
		name: 'giveFeedback',
		type: 'function',
		stateMutability: 'nonpayable',
		inputs: [
			{ name: 'agentId', type: 'uint256' },
			{ name: 'value', type: 'int128' },
			{ name: 'decimals', type: 'uint8' },
			{ name: 'tag1', type: 'string' },
			{ name: 'tag2', type: 'string' },
			{ name: 'endpoint', type: 'string' },
			{ name: 'feedbackURI', type: 'string' },
			{ name: 'feedbackHash', type: 'bytes32' },
		],
		outputs: [],
	},
	{
		name: 'getSummary',
		type: 'function',
		stateMutability: 'view',
		inputs: [
			{ name: 'agentId', type: 'uint256' },
			{ name: 'clientAddresses', type: 'address[]' },
			{ name: 'tag1', type: 'string' },
			{ name: 'tag2', type: 'string' },
		],
		outputs: [
			{ name: 'count', type: 'uint256' },
			{ name: 'avg', type: 'int128' },
		],
	},
] as const;

export const BASE_SEPOLIA_CHAIN_ID = 84532;
