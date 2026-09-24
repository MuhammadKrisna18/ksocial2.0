import type { Handle, HandleServerError } from '@sveltejs/kit';
import { container } from '$lib/infrastructure/config/container';
import type { RoleNameType } from '$lib/domain/value-objects/RoleName';
import { apiRateLimiter, getClientIp } from '$lib/infrastructure/security/RateLimiter';

const PUBLIC_ROUTES = new Set(['/', '/login', '/register', '/logout']);

const PROTECTED_ROUTES: Array<{ pattern: RegExp; roles: RoleNameType[] }> = [
	{ pattern: /^\/admin/, roles: ['admin'] },
	{ pattern: /^\/user/, roles: ['user', 'admin'] }
];

function extractToken(event: Parameters<Handle>[0]['event']): string | undefined {
	const authHeader = event.request.headers.get('authorization');
	if (authHeader?.startsWith('Bearer ')) {
		return authHeader.slice(7);
	}
	return event.cookies.get('access_token');
}

function isApiRoute(pathname: string): boolean {
	return pathname.startsWith('/api/');
}

export const handle: Handle = async ({ event, resolve }) => {
	const token = extractToken(event);

	event.locals.user = null;

	if (token) {
		try {
			event.locals.user = container.validateTokenUseCase.execute(token);
		} catch {
			event.cookies.delete('access_token', { path: '/' });
		}
	}

	const { pathname } = event.url;

	const STATIC_ASSET_REGEX = /\.(css|js|png|jpg|jpeg|webp|gif|svg|ico|woff2?|map|txt|webmanifest)$/i;

	if (pathname.startsWith('/_') || pathname.startsWith('/@') || STATIC_ASSET_REGEX.test(pathname)) {
		return resolve(event);
	}

	// Anti-DoS rate limiting for API routes
	if (isApiRoute(pathname)) {
		const clientIp = getClientIp(event);
		const rateCheck = apiRateLimiter.consume(clientIp);
		if (!rateCheck.allowed) {
			return new Response(
				JSON.stringify({
					error: 'Too many requests. Please slow down.',
					retryAfter: rateCheck.resetInSeconds
				}),
				{
					status: 429,
					headers: {
						'Content-Type': 'application/json',
						...apiRateLimiter.getHeaders(rateCheck)
					}
				}
			);
		}
	}

	if (!PUBLIC_ROUTES.has(pathname)) {
		if (!event.locals.user) {
			if (isApiRoute(pathname)) {
				return new Response(JSON.stringify({ error: 'Unauthorized' }), {
					status: 401,
					headers: { 'Content-Type': 'application/json' }
				});
			}
			return new Response(null, { status: 302, headers: { location: '/login' } });
		}

		const matchedRoute = PROTECTED_ROUTES.find(({ pattern }) => pattern.test(pathname));
		if (matchedRoute) {
			const userRoles = event.locals.user.roles ?? [];
			const hasAccess = matchedRoute.roles.some((r) => userRoles.includes(r));

			if (!hasAccess) {
				if (isApiRoute(pathname)) {
					return new Response(JSON.stringify({ error: 'Forbidden' }), {
						status: 403,
						headers: { 'Content-Type': 'application/json' }
					});
				}

				const fallbackPath = userRoles.includes('admin') ? '/admin' : '/user';
				return new Response(null, { status: 302, headers: { location: fallbackPath } });
			}
		}
	}

	const userThemeCookieName = event.locals.user ? `theme_${event.locals.user.sub}` : 'theme';
	const theme = event.cookies.get(userThemeCookieName) || 'light';
	event.locals.theme = theme;

	const response = await resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%sveltekit.html.attributes%', `class="${theme}"`)
	});

	// Standard Security Headers
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

	if (!PUBLIC_ROUTES.has(pathname)) {
		response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
		response.headers.set('Pragma', 'no-cache');
		response.headers.set('Expires', '0');
	}

	if (pathname === '/logout' || event.url.search.includes('logout')) {
		response.headers.set('Clear-Site-Data', '"cache", "cookies", "storage"');
	}

	return response;
};

export const handleError: HandleServerError = ({ error, event }) => {
	console.error('[SERVER ERROR]', event.url.pathname, error);
	return {
		message: error instanceof Error ? error.message : 'Internal Error'
	};
};


