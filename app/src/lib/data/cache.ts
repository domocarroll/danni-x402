import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const CACHE_DIR = '.cache';
const DEFAULT_TTL_MS = 60 * 60 * 1000; // 1 hour

interface CacheEntry<T> {
	data: T;
	timestamp: number;
	ttlMs: number;
}

function cacheFilePath(key: string): string {
	const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, '_');
	return join(CACHE_DIR, `${safeKey}.json`);
}

export async function getCached<T>(key: string): Promise<T | null> {
	try {
		const raw = await readFile(cacheFilePath(key), 'utf-8');
		const entry: CacheEntry<T> = JSON.parse(raw);
		const age = Date.now() - entry.timestamp;
		if (age > entry.ttlMs) return null;
		return entry.data;
	} catch {
		return null;
	}
}

export async function setCache<T>(key: string, data: T, ttlMs = DEFAULT_TTL_MS): Promise<void> {
	try {
		await mkdir(CACHE_DIR, { recursive: true });
		const entry: CacheEntry<T> = { data, timestamp: Date.now(), ttlMs };
		await writeFile(cacheFilePath(key), JSON.stringify(entry), 'utf-8');
	} catch (err) {
		console.error(`[cache] Failed to write key=${key}:`, err);
	}
}
