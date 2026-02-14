import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SubagentTracker } from './tracker.js';
import { StreamingTracker } from './streaming-tracker.js';
import { withTimeout, formatAgentInput, extractSources, loadPrompt } from './utils.js';
import type { LLMProvider } from '$lib/types/llm.js';
import type { AgentOutput, SwarmInput } from '$lib/types/swarm.js';

// Mock the prompt registry for tests
vi.mock('$lib/swarm/prompts/index.js', () => ({
	getPrompt: vi.fn((filename: string) => {
		const prompts: Record<string, string> = {
			'market-analyst.txt': 'You are the Market Analyst.',
			'competitive-intel.txt': 'You are the Competitive Intelligence Analyst.',
			'cultural-resonance.txt': 'You are the Cultural Resonance Analyst.',
			'brand-architect.txt': 'You are the Brand Architect.',
			'danni-synthesis.txt': 'You are Danni. Synthesize all agent outputs.',
		};
		const prompt = prompts[filename];
		if (!prompt) throw new Error(`Prompt not found: ${filename}`);
		return prompt;
	}),
}));

// Mock LLM provider
function createMockProvider(response = 'Mock analysis output'): LLMProvider {
	return {
		complete: vi.fn().mockResolvedValue(response),
	};
}

function createSlowProvider(delayMs: number): LLMProvider {
	return {
		complete: vi.fn().mockImplementation(
			() => new Promise((resolve) => setTimeout(() => resolve('Delayed response'), delayMs))
		),
	};
}

function createFailingProvider(errorMsg = 'LLM error'): LLMProvider {
	return {
		complete: vi.fn().mockRejectedValue(new Error(errorMsg)),
	};
}

// ─── SubagentTracker ─────────────────────────────────────────

describe('SubagentTracker', () => {
	let tracker: SubagentTracker;

	beforeEach(() => {
		tracker = new SubagentTracker();
	});

	it('records agent start events', () => {
		tracker.logStart('Market Analyst');
		const events = tracker.getEvents();
		expect(events).toHaveLength(1);
		expect(events[0].event).toBe('agent_start');
		expect(events[0].agentName).toBe('Market Analyst');
	});

	it('records agent completion events', () => {
		tracker.logStart('Market Analyst');
		tracker.logComplete('Market Analyst', 'output text', 1500);
		const events = tracker.getEvents();
		expect(events).toHaveLength(2);
		expect(events[1].event).toBe('agent_complete');
		expect(events[1].durationMs).toBe(1500);
		expect(events[1].outputLength).toBe(11);
	});

	it('records agent failure events', () => {
		tracker.logStart('Market Analyst');
		tracker.logFail('Market Analyst', 'Connection error', 500);
		const events = tracker.getEvents();
		expect(events).toHaveLength(2);
		expect(events[1].event).toBe('agent_fail');
		expect(events[1].error).toBe('Connection error');
	});

	it('returns immutable copy of events', () => {
		tracker.logStart('Agent A');
		const events1 = tracker.getEvents();
		tracker.logStart('Agent B');
		const events2 = tracker.getEvents();
		expect(events1).toHaveLength(1);
		expect(events2).toHaveLength(2);
	});

	it('computes summary correctly', () => {
		tracker.logStart('A');
		tracker.logComplete('A', 'out', 100);
		tracker.logStart('B');
		tracker.logFail('B', 'err', 200);
		tracker.logStart('C');
		tracker.logComplete('C', 'out', 300);

		const summary = tracker.getSummary();
		expect(summary.total).toBe(3);
		expect(summary.completed).toBe(2);
		expect(summary.failed).toBe(1);
		expect(summary.totalDurationMs).toBe(600);
	});

	it('handles empty tracker', () => {
		const summary = tracker.getSummary();
		expect(summary.total).toBe(0);
		expect(summary.completed).toBe(0);
		expect(summary.failed).toBe(0);
		expect(summary.totalDurationMs).toBe(0);
	});
});

// ─── StreamingTracker ────────────────────────────────────────

describe('StreamingTracker', () => {
	it('emits events through callback', () => {
		const events: unknown[] = [];
		const tracker = new StreamingTracker((evt) => events.push(evt));

		tracker.logStart('Agent');
		tracker.logComplete('Agent', 'done', 100);

		expect(events).toHaveLength(2);
		expect((events[0] as { event: string }).event).toBe('agent_start');
		expect((events[1] as { event: string }).event).toBe('agent_complete');
	});

	it('emits custom lifecycle events', () => {
		const events: unknown[] = [];
		const tracker = new StreamingTracker((evt) => events.push(evt));

		tracker.emitPaymentConfirmed();
		tracker.emitSynthesisStart();
		tracker.emitSynthesisComplete();

		expect(events).toHaveLength(3);
		expect((events[0] as { event: string }).event).toBe('payment_confirmed');
		expect((events[1] as { event: string }).event).toBe('synthesis_start');
		expect((events[2] as { event: string }).event).toBe('synthesis_complete');
	});

	it('still records to parent tracker events', () => {
		const tracker = new StreamingTracker(() => {});
		tracker.logStart('Agent');
		tracker.logComplete('Agent', 'done', 100);

		const summary = tracker.getSummary();
		expect(summary.completed).toBe(1);
	});
});

// ─── Utils ───────────────────────────────────────────────────

describe('Utils', () => {
	describe('loadPrompt', () => {
		it('loads market-analyst prompt', async () => {
			const prompt = await loadPrompt('market-analyst.txt');
			expect(prompt).toContain('Market Analyst');
		});

		it('loads all five prompts', async () => {
			const filenames = [
				'market-analyst.txt',
				'competitive-intel.txt',
				'cultural-resonance.txt',
				'brand-architect.txt',
				'danni-synthesis.txt',
			];
			for (const f of filenames) {
				const prompt = await loadPrompt(f);
				expect(prompt.length).toBeGreaterThan(0);
			}
		});

		it('throws for unknown prompt', async () => {
			await expect(loadPrompt('nonexistent.txt')).rejects.toThrow('Prompt not found');
		});
	});

	describe('withTimeout', () => {
		it('resolves before timeout', async () => {
			const result = await withTimeout(
				Promise.resolve('done'),
				1000,
				'test'
			);
			expect(result).toBe('done');
		});

		it('rejects on timeout', async () => {
			const slow = new Promise((resolve) => setTimeout(resolve, 5000));
			await expect(withTimeout(slow, 50, 'slow-agent')).rejects.toThrow(
				'slow-agent timed out after 50ms'
			);
		});

		it('propagates original error', async () => {
			const failing = Promise.reject(new Error('original error'));
			await expect(withTimeout(failing, 1000, 'test')).rejects.toThrow('original error');
		});
	});

	describe('formatAgentInput', () => {
		it('formats complete input', () => {
			const result = formatAgentInput({
				brief: 'Analyze Nike',
				brand: 'Nike',
				industry: 'Sportswear',
			});
			expect(result).toContain('## Strategic Brief');
			expect(result).toContain('Analyze Nike');
			expect(result).toContain('Nike');
			expect(result).toContain('Sportswear');
		});

		it('handles missing brand and industry', () => {
			const result = formatAgentInput({ brief: 'Quick analysis' });
			expect(result).toContain('Not specified');
		});
	});

	describe('extractSources', () => {
		it('extracts citation lines', () => {
			const output = `Some analysis.
[1] McKinsey Global Survey 2025
[2] Industry inference - based on market patterns
More text here.`;
			const sources = extractSources(output);
			expect(sources).toHaveLength(2);
			expect(sources[0]).toBe('McKinsey Global Survey 2025');
			expect(sources[1]).toBe('Industry inference - based on market patterns');
		});

		it('returns empty for no citations', () => {
			expect(extractSources('No citations here')).toEqual([]);
		});

		it('handles multiple digits', () => {
			const output = '[10] Tenth source\n[11] Eleventh source';
			const sources = extractSources(output);
			expect(sources).toHaveLength(2);
		});
	});
});

// ─── Individual Agents ───────────────────────────────────────

describe('Agent Runners', () => {
	let tracker: SubagentTracker;

	beforeEach(() => {
		tracker = new SubagentTracker();
	});

	describe('Market Analyst', () => {
		it('calls provider with correct prompt', async () => {
			const { runMarketAnalyst } = await import('./agents/market-analyst.js');
			const provider = createMockProvider('Market analysis result');

			const result = await runMarketAnalyst({
				provider,
				brief: 'Analyze the sportswear market',
				brand: 'Nike',
				industry: 'Sportswear',
				tracker,
			});

			expect(result.agentName).toBe('Market Analyst');
			expect(result.status).toBe('completed');
			expect(result.output).toBe('Market analysis result');
			expect(provider.complete).toHaveBeenCalledOnce();
		});

		it('handles provider failure gracefully', async () => {
			const { runMarketAnalyst } = await import('./agents/market-analyst.js');
			const provider = createFailingProvider('API rate limited');

			const result = await runMarketAnalyst({
				provider,
				brief: 'Test brief',
				tracker,
			});

			expect(result.status).toBe('failed');
			expect(result.output).toContain('API rate limited');
		});

		it('handles timeout', async () => {
			const { runMarketAnalyst } = await import('./agents/market-analyst.js');
			const provider = createSlowProvider(5000);

			const result = await runMarketAnalyst({
				provider,
				brief: 'Test brief',
				tracker,
				timeoutMs: 50,
			});

			expect(result.status).toBe('timeout');
		});

		it('records events in tracker', async () => {
			const { runMarketAnalyst } = await import('./agents/market-analyst.js');
			const provider = createMockProvider();

			await runMarketAnalyst({
				provider,
				brief: 'Test',
				tracker,
			});

			const summary = tracker.getSummary();
			expect(summary.completed).toBe(1);
		});
	});

	describe('Competitive Intelligence', () => {
		it('executes successfully', async () => {
			const { runCompetitiveIntel } = await import('./agents/competitive-intel.js');
			const provider = createMockProvider('Competitive analysis');

			const result = await runCompetitiveIntel({
				provider,
				brief: 'Analyze competitors',
				tracker,
			});

			expect(result.agentName).toBe('Competitive Intelligence');
			expect(result.status).toBe('completed');
		});
	});

	describe('Cultural Resonance', () => {
		it('executes successfully', async () => {
			const { runCulturalResonance } = await import('./agents/cultural-resonance.js');
			const provider = createMockProvider('Cultural analysis');

			const result = await runCulturalResonance({
				provider,
				brief: 'Analyze culture',
				tracker,
			});

			expect(result.agentName).toBe('Cultural Resonance');
			expect(result.status).toBe('completed');
		});
	});

	describe('Brand Architect', () => {
		it('executes successfully', async () => {
			const { runBrandArchitect } = await import('./agents/brand-architect.js');
			const provider = createMockProvider('Brand architecture');

			const result = await runBrandArchitect({
				provider,
				brief: 'Build brand',
				tracker,
			});

			expect(result.agentName).toBe('Brand Architect');
			expect(result.status).toBe('completed');
		});
	});

	describe('Danni Synthesis', () => {
		it('combines agent outputs', async () => {
			const { runDanniSynthesis } = await import('./agents/danni-synthesis.js');
			const provider = createMockProvider('Synthesized strategic brief');

			const agentOutputs: AgentOutput[] = [
				{ agentName: 'Market', status: 'completed', output: 'Market data', sources: [], durationMs: 100 },
				{ agentName: 'Competitive', status: 'completed', output: 'Competitive data', sources: [], durationMs: 100 },
			];

			const result = await runDanniSynthesis({
				provider,
				agentOutputs,
				brief: 'Original brief',
				tracker,
			});

			expect(result).toBe('Synthesized strategic brief');
			const call = (provider.complete as ReturnType<typeof vi.fn>).mock.calls[0][0];
			expect(call.userMessage).toContain('Original brief');
			expect(call.userMessage).toContain('MARKET');
			expect(call.userMessage).toContain('Market data');
		});

		it('throws on failure (does not swallow)', async () => {
			const { runDanniSynthesis } = await import('./agents/danni-synthesis.js');
			const provider = createFailingProvider('Synthesis failed');

			await expect(
				runDanniSynthesis({
					provider,
					agentOutputs: [],
					brief: 'Brief',
					tracker,
				})
			).rejects.toThrow('Danni synthesis failed');
		});
	});
});

// ─── Orchestrator Structure ──────────────────────────────────

describe('Orchestrator', () => {
	it('exports executeSwarm function', async () => {
		const mod = await import('./orchestrator.js');
		expect(typeof mod.executeSwarm).toBe('function');
	});

	it('validateSwarmOutput rejects invalid output', async () => {
		const { validateSwarmOutput } = await import('$lib/types/swarm.js');
		expect(() => validateSwarmOutput({})).toThrow();
		expect(() => validateSwarmOutput({ brief: 'test' })).toThrow();
	});

	it('validateSwarmOutput accepts valid output', async () => {
		const { validateSwarmOutput } = await import('$lib/types/swarm.js');
		const valid = {
			brief: 'Test brief',
			analysis: {
				market: { agentName: 'Market', status: 'completed', output: 'x', sources: [], durationMs: 100 },
				competitive: { agentName: 'Competitive', status: 'completed', output: 'x', sources: [], durationMs: 100 },
				cultural: { agentName: 'Cultural', status: 'completed', output: 'x', sources: [], durationMs: 100 },
				brand: { agentName: 'Brand', status: 'completed', output: 'x', sources: [], durationMs: 100 },
				synthesis: 'Combined strategic brief',
			},
			metadata: {
				agentsUsed: 5,
				dataSourcesPurchased: 3,
				totalCostUsd: 115,
				durationMs: 5000,
				txHashes: [],
			},
		};
		const result = validateSwarmOutput(valid);
		expect(result.brief).toBe('Test brief');
		expect(result.metadata.agentsUsed).toBe(5);
	});
});
