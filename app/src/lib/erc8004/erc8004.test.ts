import { describe, it, expect } from 'vitest';
import {
	ERC8004_CONTRACTS,
	IDENTITY_REGISTRY_ABI,
	REPUTATION_REGISTRY_ABI,
	BASE_SEPOLIA_CHAIN_ID,
} from './constants.js';

describe('ERC-8004 Constants', () => {
	describe('contract addresses', () => {
		it('IDENTITY_REGISTRY starts with 0x8004', () => {
			expect(ERC8004_CONTRACTS.IDENTITY_REGISTRY).toMatch(/^0x8004/);
		});

		it('REPUTATION_REGISTRY starts with 0x8004', () => {
			expect(ERC8004_CONTRACTS.REPUTATION_REGISTRY).toMatch(/^0x8004/);
		});

		it('VALIDATION_REGISTRY starts with 0x8004', () => {
			expect(ERC8004_CONTRACTS.VALIDATION_REGISTRY).toMatch(/^0x8004/);
		});

		it('all addresses are valid 42-char hex', () => {
			for (const addr of Object.values(ERC8004_CONTRACTS)) {
				expect(addr).toMatch(/^0x[0-9a-fA-F]{40}$/);
			}
		});
	});

	describe('chain ID', () => {
		it('BASE_SEPOLIA_CHAIN_ID is 84532', () => {
			expect(BASE_SEPOLIA_CHAIN_ID).toBe(84532);
		});
	});
});

describe('Identity Registry ABI', () => {
	it('defines register function', () => {
		const fn = IDENTITY_REGISTRY_ABI.find((e) => e.name === 'register');
		expect(fn).toBeDefined();
		expect(fn!.type).toBe('function');
		expect(fn!.stateMutability).toBe('nonpayable');
		expect(fn!.inputs).toHaveLength(1);
		expect(fn!.inputs[0].name).toBe('agentURI');
		expect(fn!.inputs[0].type).toBe('string');
		expect(fn!.outputs).toHaveLength(1);
		expect(fn!.outputs[0].type).toBe('uint256');
	});

	it('defines getAgentId function', () => {
		const fn = IDENTITY_REGISTRY_ABI.find((e) => e.name === 'getAgentId');
		expect(fn).toBeDefined();
		expect(fn!.stateMutability).toBe('view');
		expect(fn!.inputs[0].type).toBe('string');
		expect(fn!.outputs[0].type).toBe('uint256');
	});
});

describe('Reputation Registry ABI', () => {
	it('defines giveFeedback function', () => {
		const fn = REPUTATION_REGISTRY_ABI.find((e) => e.name === 'giveFeedback');
		expect(fn).toBeDefined();
		expect(fn!.type).toBe('function');
		expect(fn!.stateMutability).toBe('nonpayable');
		expect(fn!.inputs).toHaveLength(8);

		const inputNames = fn!.inputs.map((i) => i.name);
		expect(inputNames).toContain('agentId');
		expect(inputNames).toContain('value');
		expect(inputNames).toContain('decimals');
		expect(inputNames).toContain('tag1');
		expect(inputNames).toContain('tag2');
		expect(inputNames).toContain('endpoint');
		expect(inputNames).toContain('feedbackURI');
		expect(inputNames).toContain('feedbackHash');

		const inputTypes = fn!.inputs.map((i) => i.type);
		expect(inputTypes).toContain('uint256');
		expect(inputTypes).toContain('int128');
		expect(inputTypes).toContain('uint8');
		expect(inputTypes).toContain('bytes32');
	});

	it('defines getSummary function', () => {
		const fn = REPUTATION_REGISTRY_ABI.find((e) => e.name === 'getSummary');
		expect(fn).toBeDefined();
		expect(fn!.stateMutability).toBe('view');
		expect(fn!.outputs).toHaveLength(2);
		expect(fn!.outputs[0].name).toBe('count');
		expect(fn!.outputs[0].type).toBe('uint256');
		expect(fn!.outputs[1].name).toBe('avg');
		expect(fn!.outputs[1].type).toBe('int128');
	});

	it('getSummary accepts agentId + filter parameters', () => {
		const fn = REPUTATION_REGISTRY_ABI.find((e) => e.name === 'getSummary')!;
		expect(fn.inputs).toHaveLength(4);
		expect(fn.inputs[0].type).toBe('uint256');
		expect(fn.inputs[1].type).toBe('address[]');
		expect(fn.inputs[2].type).toBe('string');
		expect(fn.inputs[3].type).toBe('string');
	});
});
