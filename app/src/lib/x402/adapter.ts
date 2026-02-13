import type { HTTPAdapter } from '@x402/core/server';
import type { RequestEvent } from '@sveltejs/kit';

/**
 * SvelteKit adapter for the x402 payment protocol.
 * First-ever SvelteKit implementation of the HTTPAdapter interface.
 * Wraps SvelteKit's RequestEvent to provide x402-compatible HTTP access.
 */
export class SvelteKitAdapter implements HTTPAdapter {
	private event: RequestEvent;

	constructor(event: RequestEvent) {
		this.event = event;
	}

	getHeader(name: string): string | undefined {
		return this.event.request.headers.get(name) ?? undefined;
	}

	getMethod(): string {
		return this.event.request.method;
	}

	getPath(): string {
		return this.event.url.pathname;
	}

	getUrl(): string {
		return this.event.url.href;
	}

	getAcceptHeader(): string {
		return this.event.request.headers.get('Accept') ?? '';
	}

	getUserAgent(): string {
		return this.event.request.headers.get('User-Agent') ?? '';
	}

	getQueryParams(): Record<string, string | string[]> {
		const params: Record<string, string | string[]> = {};
		this.event.url.searchParams.forEach((value, key) => {
			const existing = params[key];
			if (existing) {
				if (Array.isArray(existing)) {
					params[key] = [...existing, value];
				} else {
					params[key] = [existing, value];
				}
			} else {
				params[key] = value;
			}
		});
		return params;
	}

	getQueryParam(name: string): string | string[] | undefined {
		const all = this.event.url.searchParams.getAll(name);
		if (all.length === 0) return undefined;
		if (all.length === 1) return all[0];
		return all;
	}

	async getBody(): Promise<unknown> {
		try {
			return await this.event.request.json();
		} catch {
			return undefined;
		}
	}
}
