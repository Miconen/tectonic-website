export function formatBossName(displayName: string, category: string, solo: boolean): string {
	if (solo) return displayName;
	return `${category} ${displayName}`;
}
