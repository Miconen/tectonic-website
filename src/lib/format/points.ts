export function formatPoints(n: number | null | undefined): string {
	if (n == null || !Number.isFinite(n)) return '0';
	return new Intl.NumberFormat('en-US').format(n);
}

export function rankClass(rank: number | null | undefined): string {
	if (rank === 1) return 'rank rank-1';
	if (rank === 2) return 'rank rank-2';
	if (rank === 3) return 'rank rank-3';
	return 'rank';
}

const roleValues = [
	{ min: 5000, icon: 'wrath' },
	{ min: 3750, icon: 'soul' },
	{ min: 2750, icon: 'blood' },
	{ min: 2000, icon: 'death' },
	{ min: 1500, icon: 'astral' },
	{ min: 1250, icon: 'zenyte' },
	{ min: 1000, icon: 'onyx' },
	{ min: 800, icon: 'dragonstone' },
	{ min: 600, icon: 'diamond' },
	{ min: 400, icon: 'ruby' },
	{ min: 200, icon: 'emerald' },
	{ min: 100, icon: 'sapphire' },
	{ min: 50, icon: 'red_topaz' },
	{ min: 0, icon: 'jade' }
];

export function getIconForPoints(points: number | null | undefined): string | null {
	if (points == null || !Number.isFinite(points)) return null;
	const match = roleValues.find((r) => points >= r.min);
	return match ? match.icon : null;
}

