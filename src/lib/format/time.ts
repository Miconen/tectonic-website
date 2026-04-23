/**
 * OSRS game tick = 0.6 seconds. PB times from the API are expressed in ticks.
 */
export const TICK_SECONDS = 0.6;

/**
 * Format a tick count as a human-readable duration.
 *   < 60s    -> "48.6"
 *   < 60m    -> "2:13.8"
 *   >= 60m   -> "1:02:13.8"
 * Single decimal since tick resolution is 0.6s.
 */
export function formatTicks(ticks: number | null | undefined): string {
	if (ticks == null || !Number.isFinite(ticks) || ticks < 0) return '—';
	const totalSeconds = ticks * TICK_SECONDS;
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds - hours * 3600 - minutes * 60;

	const secStr = seconds.toFixed(1).padStart(4, '0'); // "02.4"
	if (hours > 0) {
		return `${hours}:${String(minutes).padStart(2, '0')}:${secStr}`;
	}
	if (minutes > 0) {
		return `${minutes}:${secStr}`;
	}
	return seconds.toFixed(1);
}

export function formatDate(iso: string | null | undefined): string {
	if (!iso) return '—';
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return '—';
	return new Intl.DateTimeFormat('en-GB', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	}).format(d);
}

export function formatDateTime(iso: string | null | undefined): string {
	if (!iso) return '—';
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return '—';
	return new Intl.DateTimeFormat('en-GB', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	}).format(d);
}
