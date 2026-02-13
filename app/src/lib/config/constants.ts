export const NETWORKS = {
	BASE_SEPOLIA: 'eip155:84532' as const,
	SKALE_EUROPA: 'eip155:1444673419' as const
};

export const USDC = {
	BASE_SEPOLIA: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
	SKALE_EUROPA: '0xD1A64e20e93E088979631061CACa74E08B3c0f55'
};

export const FACILITATORS = {
	DEFAULT: 'https://x402.org/facilitator',
	KOBARU: 'https://gateway.kobaru.io',
};

export const PRICING = {
	BRAND_ANALYSIS: '$100',
	DATA_ENDPOINT: '$5',
};

export const SKALE = {
	EUROPA_HUB: {
		chainId: 1444673419,
		network: 'eip155:1444673419',
		rpc: 'https://mainnet.skalenodes.com/v1/elated-tan-skat',
		usdc: '0xD1A64e20e93E088979631061CACa74E08B3c0f55',
	},
	BASE_SEPOLIA_TESTNET: {
		chainId: 324705682,
		network: 'eip155:324705682',
		rpc: 'https://base-sepolia-testnet.skalenodes.com/v1/jubilant-horrible-ancha',
		usdc: '0x2e08028E3C4c2356572E096d8EF835cD5C6030bD',
	},
} as const;
