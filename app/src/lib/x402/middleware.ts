import type { Handle } from '@sveltejs/kit';
import type { PaywallConfig, PaywallProvider } from '@x402/core/server';
import {
	x402HTTPResourceServer,
	x402ResourceServer,
	type RoutesConfig,
	type FacilitatorClient
} from '@x402/core/server';
import type { SchemeNetworkServer, Network } from '@x402/core/types';
import { SvelteKitAdapter } from './adapter.js';
import type { HTTPRequestContext } from '@x402/core/server';

export interface SchemeRegistration {
	network: Network;
	server: SchemeNetworkServer;
}

export interface PaymentHookConfig {
	routes: RoutesConfig;
	facilitatorClients?: FacilitatorClient | FacilitatorClient[];
	schemes?: SchemeRegistration[];
	paywallConfig?: PaywallConfig;
	paywall?: PaywallProvider;
	syncFacilitatorOnStart?: boolean;
}

/**
 * Creates a SvelteKit Handle hook that enforces x402 payment on configured routes.
 * First-ever SvelteKit x402 middleware.
 *
 * Usage in hooks.server.ts:
 *   export const handle = sequence(createPaymentHook({ routes, ... }));
 */
export function createPaymentHook(config: PaymentHookConfig): Handle {
	const {
		routes,
		facilitatorClients,
		schemes,
		paywallConfig,
		paywall,
		syncFacilitatorOnStart = true
	} = config;

	const resourceServer = new x402ResourceServer(facilitatorClients);

	if (schemes) {
		for (const { network, server: schemeServer } of schemes) {
			resourceServer.register(network, schemeServer);
		}
	}

	const httpServer = new x402HTTPResourceServer(resourceServer, routes);

	if (paywall) {
		httpServer.registerPaywallProvider(paywall);
	}

	let initPromise: Promise<void> | null = syncFacilitatorOnStart
		? httpServer.initialize()
		: null;

	return async ({ event, resolve }) => {
		const adapter = new SvelteKitAdapter(event);
		const context: HTTPRequestContext = {
			adapter,
			path: event.url.pathname,
			method: event.request.method,
			paymentHeader:
				adapter.getHeader('payment-signature') ?? adapter.getHeader('x-payment')
		};

		if (!httpServer.requiresPayment(context)) {
			return resolve(event);
		}

		if (initPromise) {
			await initPromise;
			initPromise = null;
		}

		const result = await httpServer.processHTTPRequest(context, paywallConfig);

		switch (result.type) {
			case 'no-payment-required':
				return resolve(event);

			case 'payment-error': {
				const { response } = result;
				const headers = new Headers();
				for (const [key, value] of Object.entries(response.headers)) {
					headers.set(key, value);
				}

				if (response.isHtml) {
					headers.set('Content-Type', 'text/html');
					return new Response(response.body as string, {
						status: response.status,
						headers
					});
				}

				headers.set('Content-Type', 'application/json');
				return new Response(JSON.stringify(response.body ?? {}), {
					status: response.status,
					headers
				});
			}

			case 'payment-verified': {
				const { paymentPayload, paymentRequirements, declaredExtensions } = result;

				const response = await resolve(event);

				if (response.status >= 400) {
					return response;
				}

				try {
					const settleResult = await httpServer.processSettlement(
						paymentPayload,
						paymentRequirements,
						declaredExtensions
					);

					if (!settleResult.success) {
						return new Response(
							JSON.stringify({
								error: 'Settlement failed',
								details: settleResult.errorReason
							}),
							{
								status: 402,
								headers: { 'Content-Type': 'application/json' }
							}
						);
					}

					const settledHeaders = new Headers(response.headers);
					for (const [key, value] of Object.entries(settleResult.headers)) {
						settledHeaders.set(key, value);
					}

					return new Response(response.body, {
						status: response.status,
						statusText: response.statusText,
						headers: settledHeaders
					});
				} catch (error) {
					return new Response(
						JSON.stringify({
							error: 'Settlement failed',
							details: error instanceof Error ? error.message : 'Unknown error'
						}),
						{
							status: 402,
							headers: { 'Content-Type': 'application/json' }
						}
					);
				}
			}
		}
	};
}

/**
 * Creates a payment hook from a pre-configured x402HTTPResourceServer.
 * For advanced use cases where you need custom hooks on the HTTP server.
 */
export function createPaymentHookFromHTTPServer(
	httpServer: x402HTTPResourceServer,
	paywallConfig?: PaywallConfig,
	paywall?: PaywallProvider,
	syncFacilitatorOnStart: boolean = true
): Handle {
	if (paywall) {
		httpServer.registerPaywallProvider(paywall);
	}

	let initPromise: Promise<void> | null = syncFacilitatorOnStart
		? httpServer.initialize()
		: null;

	return async ({ event, resolve }) => {
		const adapter = new SvelteKitAdapter(event);
		const context: HTTPRequestContext = {
			adapter,
			path: event.url.pathname,
			method: event.request.method,
			paymentHeader:
				adapter.getHeader('payment-signature') ?? adapter.getHeader('x-payment')
		};

		if (!httpServer.requiresPayment(context)) {
			return resolve(event);
		}

		if (initPromise) {
			await initPromise;
			initPromise = null;
		}

		const result = await httpServer.processHTTPRequest(context, paywallConfig);

		switch (result.type) {
			case 'no-payment-required':
				return resolve(event);

			case 'payment-error': {
				const { response } = result;
				const headers = new Headers();
				for (const [key, value] of Object.entries(response.headers)) {
					headers.set(key, value);
				}
				if (response.isHtml) {
					headers.set('Content-Type', 'text/html');
					return new Response(response.body as string, {
						status: response.status,
						headers
					});
				}
				headers.set('Content-Type', 'application/json');
				return new Response(JSON.stringify(response.body ?? {}), {
					status: response.status,
					headers
				});
			}

			case 'payment-verified': {
				const { paymentPayload, paymentRequirements, declaredExtensions } = result;
				const response = await resolve(event);

				if (response.status >= 400) {
					return response;
				}

				try {
					const settleResult = await httpServer.processSettlement(
						paymentPayload,
						paymentRequirements,
						declaredExtensions
					);

					if (!settleResult.success) {
						return new Response(
							JSON.stringify({
								error: 'Settlement failed',
								details: settleResult.errorReason
							}),
							{
								status: 402,
								headers: { 'Content-Type': 'application/json' }
							}
						);
					}

					const settledHeaders = new Headers(response.headers);
					for (const [key, value] of Object.entries(settleResult.headers)) {
						settledHeaders.set(key, value);
					}

					return new Response(response.body, {
						status: response.status,
						statusText: response.statusText,
						headers: settledHeaders
					});
				} catch (error) {
					return new Response(
						JSON.stringify({
							error: 'Settlement failed',
							details: error instanceof Error ? error.message : 'Unknown error'
						}),
						{
							status: 402,
							headers: { 'Content-Type': 'application/json' }
						}
					);
				}
			}
		}
	};
}
