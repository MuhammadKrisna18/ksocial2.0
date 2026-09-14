import type { Handle } from '@sveltejs/kit';
import { container } from '$lib/infrastructure/config/container';
import type { RoleNameType } from '$lib/domain/value-objects/RoleName';

const PUBLIC_ROUTES = new Set(['/', '/login', '/register']);

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

	// Skip authentication checks for static assets and Vite internals
	if (pathname.startsWith('/_') || pathname.startsWith('/@') || pathname.includes('.')) {
		return resolve(event);
	}

	if (!PUBLIC_ROUTES.has(pathname)) {
		// 1. Require authentication for ALL non-public routes
		if (!event.locals.user) {
			if (isApiRoute(pathname)) {
				return new Response(JSON.stringify({ error: 'Unauthorized' }), {
					status: 401,
					headers: { 'Content-Type': 'application/json' }
				});
			}
			return new Response(null, { status: 302, headers: { location: '/login' } });
		}

		// 2. Check role permissions if the route is explicitly protected
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

	return resolve(event);
};
