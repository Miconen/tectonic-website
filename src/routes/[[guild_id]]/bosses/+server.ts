import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ url }) => {
	// Keep the guild_id segment intact if present
	const newPath = url.pathname.replace(/\/bosses$/, '/pbs');
	throw redirect(302, newPath);
};
