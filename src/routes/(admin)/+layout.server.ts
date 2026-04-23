import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

/**
 * Admin area. Intentionally gated until Discord OAuth is wired up in
 * hooks.server.ts and a real session is attached to `locals`.
 */
export const load: LayoutServerLoad = async ({ locals }) => {
	// locals.user will be populated by hooks.server.ts once auth is implemented.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const user = (locals as any).user;
	if (!user) {
		throw error(401, 'Admin area not yet implemented. Authentication required.');
	}
	return { user };
};
