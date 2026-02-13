import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';
import { synthesizeSpeech } from '$lib/voice/index.js';

const SynthesizeRequestSchema = z.object({
	text: z.string().min(1, 'Text must be non-empty').max(5000, 'Text must be under 5,000 characters'),
});

/**
 * POST /api/voice/synthesize
 *
 * Synthesizes speech from text using ElevenLabs TTS.
 * Returns audio/mpeg stream if voice is configured,
 * or 503 if ELEVENLABS_API_KEY is not set.
 */
export const POST: RequestHandler = async ({ request }) => {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	const parsed = SynthesizeRequestSchema.safeParse(body);
	if (!parsed.success) {
		return json({ error: parsed.error.issues[0].message }, { status: 400 });
	}

	const { text } = parsed.data;

	try {
		const audioBuffer = await synthesizeSpeech(text);

		if (!audioBuffer) {
			return json(
				{ error: 'Voice not configured' },
				{ status: 503 },
			);
		}

		return new Response(audioBuffer, {
			headers: {
				'Content-Type': 'audio/mpeg',
				'Content-Length': String(audioBuffer.byteLength),
				'Cache-Control': 'public, max-age=3600',
			},
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Voice synthesis failed';
		console.error('Voice synthesis error:', message);
		return json({ error: 'Voice synthesis failed' }, { status: 500 });
	}
};
