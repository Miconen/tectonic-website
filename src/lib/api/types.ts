/**
 * Hand-written domain types matching the Tectonic API's `components/schemas`.
 * Kept narrow and flat — the API wraps nullable SQL types in { String, Valid } /
 * { Int, Valid, ... } which is unwrapped via $lib/api/unwrap before it reaches
 * the UI, so these types describe the *post-unwrap* shape where noted.
 *
 * If you regenerate `types.gen.ts` with openapi-typescript you can swap imports
 * at any time; we keep this file as the canonical shape the UI consumes.
 */

// --- raw SQL-null wrappers (as they come off the wire) ---
export interface RawText {
	String: string;
	Valid: boolean;
}
export interface RawNumeric {
	Int: string | null;
	Exp: number;
	NaN: boolean;
	InfinityModifier: number;
	Valid: boolean;
}

// --- simple entities ---
export interface Achievement {
	name: string;
	thumbnail: string;
	discord_icon: string;
	order: number;
}

export interface Boss {
	name: string;
	display_name: string;
	category: string;
	solo: boolean;
}

/** Category thumbnail is nullable in the raw API; unwrapped to string | null. */
export interface Category {
	name: string;
	order: number;
	thumbnail: string | null;
}

export interface UserRsn {
	rsn: string;
	wom_id: string;
}

export interface LeaderboardUser {
	user_id: string;
	guild_id: string;
	points: number;
	rsns: UserRsn[];
}

export interface GuildPb {
	run_id: number;
	time: number;
	boss_name: string;
	date: string;
	guild_id: string;
}

export interface GuildTeammate {
	run_id: number;
	user_id: string;
	guild_id: string;
}

export interface GuildBoss {
	name: string;
	display_name: string;
	category: string;
	solo: boolean;
}

export interface GuildCategory {
	name: string;
	order: number;
	thumbnail: string;
}

export interface GuildBossEntry {
	boss: string;
	guild_id: string;
	pb_id: number | null;
	category: string;
}

export interface GuildCategoryEntry {
	category: string;
	guild_id: string;
	message_id: string;
}

export interface GetGuildCombatAchievementsRow {
	name: string;
	point_source: string;
	point_source_display_name: string;
	points: number;
}

export interface DetailedGuild {
	guild_id: string;
	pb_channel_id: string | null;
	teammates: GuildTeammate[];
	pbs: GuildPb[];
	bosses: GuildBoss[];
	categories: GuildCategory[];
	guild_bosses: GuildBossEntry[];
	guild_categories: GuildCategoryEntry[];
}

export interface UserAchievement {
	name: string;
	thumbnail: string;
	discord_icon: string;
	order: number;
}

export interface UserCombatAchievement {
	name: string;
}

export interface UserEvent {
	name: string;
	wom_id: string;
	guild_id: string;
	placement: number;
	position_cutoff: number;
	solo: boolean;
}

export interface TimeTeammates {
	user_id: string;
	guild_id: string;
}

export interface UserTime {
	run_id: number;
	boss_name: string;
	display_name: string;
	category: string;
	solo: boolean;
	date: string;
	time: number;
	team: TimeTeammates[];
}

export interface DetailedUser {
	user_id: string;
	guild_id: string;
	points: number;
	rsns: UserRsn[];
	times: UserTime[];
	events: UserEvent[];
	achievements: UserAchievement[];
	combat_achievements: UserCombatAchievement[];
	/**
	 * Clan rank (#1 = highest points). Added by upcoming API change; tolerate
	 * missing values by treating as undefined.
	 */
	rank?: number;
}

export interface Event {
	name: string;
	wom_id: string;
	guild_id: string;
	position_cutoff: number;
	solo: boolean;
}

export interface EventParticipation {
	user_id: string;
	placement: number;
}

export interface DetailedEvent {
	participations: EventParticipation[];
}

// --- error ---
export interface ErrorModel {
	type?: string;
	title?: string;
	status?: number;
	detail?: string;
	instance?: string;
}
