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
	{ min: 5000, icon: 'Wrath' },
	{ min: 3750, icon: 'Soul' },
	{ min: 2750, icon: 'Blood' },
	{ min: 2000, icon: 'Death' },
	{ min: 1500, icon: 'Astral' },
	{ min: 1250, icon: 'Zenyte' },
	{ min: 1000, icon: 'Onyx' },
	{ min: 800, icon: 'Dragonstone' },
	{ min: 600, icon: 'Diamond' },
	{ min: 400, icon: 'Ruby' },
	{ min: 200, icon: 'Emerald' },
	{ min: 100, icon: 'Sapphire' },
	{ min: 50, icon: 'Red_Topaz' },
	{ min: 0, icon: 'Jade' }
];

export function getIconForPoints(points: number | null | undefined): string | null {
	if (points == null || !Number.isFinite(points)) return null;
	const match = roleValues.find((r) => points >= r.min);
	return match ? match.icon : null;
}

