export { SvelteKitAdapter } from './adapter.js';
export { createPaymentHook, createPaymentHookFromHTTPServer } from './middleware.js';
export type { PaymentHookConfig, SchemeRegistration } from './middleware.js';

export { x402ResourceServer, x402HTTPResourceServer } from '@x402/core/server';

export type {
	PaymentRequired,
	PaymentRequirements,
	PaymentPayload,
	Network,
	SchemeNetworkServer
} from '@x402/core/types';

export type { PaywallProvider, PaywallConfig, RoutesConfig, RouteConfig } from '@x402/core/server';
