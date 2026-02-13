import type { ElevenLabsConfig } from './types.js';

export async function synthesizeSpeech(
	text: string,
	config?: Partial<ElevenLabsConfig>,
): Promise<ArrayBuffer | null> {
	const apiKey = process.env.ELEVENLABS_API_KEY;
	if (!apiKey) {
		console.warn('ELEVENLABS_API_KEY not set — voice disabled');
		return null;
	}

	const voiceId = config?.voiceId ?? 'EXAVITQu4vr4xnSDxMaL'; // Sarah - sophisticated female
	const modelId = config?.modelId ?? 'eleven_multilingual_v2';

	const response = await fetch(
		`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
		{
			method: 'POST',
			headers: {
				'xi-api-key': apiKey,
				'Content-Type': 'application/json',
				Accept: 'audio/mpeg',
			},
			body: JSON.stringify({
				text,
				model_id: modelId,
				voice_settings: {
					stability: config?.stability ?? 0.65,
					similarity_boost: config?.similarityBoost ?? 0.75,
					style: config?.style ?? 0.35,
					use_speaker_boost: true,
				},
			}),
		},
	);

	if (!response.ok) {
		console.error(
			'ElevenLabs TTS failed:',
			response.status,
			await response.text(),
		);
		return null;
	}

	return response.arrayBuffer();
}
