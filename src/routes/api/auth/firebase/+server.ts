import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { container } from '$lib/infrastructure/config/container';
import { ACCESS_TOKEN_COOKIE, getAuthCookieOptions } from '$lib/presentation/utils/cookie';
import { dev } from '$app/environment';

import { firebaseConfig } from '$lib/infrastructure/external-services/firebaseClient';

export const POST: RequestHandler = async ({ request, cookies }) => {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	const idToken =
		typeof body === 'object' && body !== null && 'idToken' in body
			? (body as { idToken?: unknown }).idToken
			: undefined;

	if (typeof idToken !== 'string' || !idToken.trim()) {
		return json({ error: 'Missing idToken' }, { status: 400 });
	}

	try {
		// Verify Google Firebase ID Token via Firebase Identity Toolkit
		const verifyRes = await fetch(
			`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseConfig.apiKey}`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ idToken })
			}
		);

		if (!verifyRes.ok) {
			return json({ error: 'Firebase token is invalid or expired' }, { status: 401 });
		}

		const payload = (await verifyRes.json()) as {
			users?: Array<{
				localId?: string;
				email?: string;
				displayName?: string;
				photoUrl?: string;
			}>;
		};

		const userRecord = payload.users?.[0];
		if (!userRecord || !userRecord.email) {
			return json({ error: 'Google account did not provide an email' }, { status: 400 });
		}

		const result = await container.firebaseAuthUseCase.execute({
			email: userRecord.email,
			name: userRecord.displayName || userRecord.email.split('@')[0],
			picture: userRecord.photoUrl || undefined,
			googleUid: userRecord.localId || userRecord.email
		});

		cookies.set(ACCESS_TOKEN_COOKIE, result.accessToken, getAuthCookieOptions(!dev));

		const roles = result.user.roles ?? [];
		const redirectUrl = roles.includes('admin') ? '/admin' : '/user';

		return json({ success: true, redirectUrl });
	} catch (err: unknown) {
		console.error('Firebase Auth error:', err);
		const message = err instanceof Error ? err.message : 'Authentication failed';
		return json({ error: message }, { status: 500 });
	}
};
