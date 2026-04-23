export function formatBossName(displayName: string, category: string): string {
	if (!category) return displayName;
	
	const d = displayName.toLowerCase();
	const c = category.toLowerCase();
	
	// If the display name already contains the category (e.g. "Zulrah" in "Zulrah")
	// or the category contains the display name, don't combine them.
	if (d.includes(c) || c.includes(d)) {
		return displayName;
	}
	
	// For bosses that are missing context in their display name (like "Solo", "Challenge Mode")
	return `${category} ${displayName}`;
}
