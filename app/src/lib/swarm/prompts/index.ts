/**
 * Prompt registry — inlines prompt files at build time via Vite ?raw imports.
 * This ensures prompts are available in production Docker builds where
 * the source filesystem isn't present.
 */
import marketAnalystPrompt from './market-analyst.txt?raw';
import competitiveIntelPrompt from './competitive-intel.txt?raw';
import culturalResonancePrompt from './cultural-resonance.txt?raw';
import brandArchitectPrompt from './brand-architect.txt?raw';
import danniSynthesisPrompt from './danni-synthesis.txt?raw';

const PROMPTS: Record<string, string> = {
	'market-analyst.txt': marketAnalystPrompt,
	'competitive-intel.txt': competitiveIntelPrompt,
	'cultural-resonance.txt': culturalResonancePrompt,
	'brand-architect.txt': brandArchitectPrompt,
	'danni-synthesis.txt': danniSynthesisPrompt,
};

/**
 * Get a prompt by filename. Throws if not found.
 * Prompts are inlined at build time — no filesystem access needed.
 */
export function getPrompt(filename: string): string {
	const prompt = PROMPTS[filename];
	if (!prompt) {
		throw new Error(`Prompt not found: ${filename}. Available: ${Object.keys(PROMPTS).join(', ')}`);
	}
	return prompt.trim();
}
