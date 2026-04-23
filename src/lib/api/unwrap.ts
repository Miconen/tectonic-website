/**
 * Unwrappers for the Go `sql.NullString` / pgx `numeric` shapes that leak
 * through the API. Use these at the API-client boundary, not in components.
 */
import type { RawText, RawNumeric } from './types';

export function text(v: RawText | null | undefined): string | null {
	if (!v || !v.Valid) return null;
	return v.String;
}

export function numeric(v: RawNumeric | null | undefined): number | null {
	if (!v || !v.Valid || v.NaN) return null;
	if (!v.Int) return null;
	const base = Number(v.Int);
	if (!Number.isFinite(base)) return null;
	return base * Math.pow(10, v.Exp ?? 0);
}
