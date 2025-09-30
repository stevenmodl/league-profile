// lib/types.ts

/**
 * Rank snapshot data
 */
export type RankData = {
	tier: string;
	rank: string;
	lp: number;
	wins: number;
	losses: number;
	hotStreak?: boolean;
	queueType: string;
} | null;

/**
 * Rank history point for graphing
 */
export type RankHistoryPoint = {
	t: Date;
	tier: string;
	rank: string;
	lp: number;
};

/**
 * Match aggregate data
 */
export type MatchData = {
	id: string;
	matchId: string;
	createdAt: Date;
	queueId: number;
	win: boolean;
	k: number;
	d: number;
	a: number;
	csPerMin: number;
	goldPerMin: number;
	dmgShare: number | null;
	champId: number;
	champName: string;
	role: string | null;
	lpChange: number | null;
};

/**
 * Champion stats aggregate
 */
export type ChampionStats = {
	champId: number;
	champName: string;
	games: number;
	wins: number;
	winrate: number;
	kda?: number;
};

/**
 * Profile data shape returned by repo
 */
export type ProfileData = {
	updatedAt: Date;
	rank: RankData;
	rankHistory: RankHistoryPoint[];
	matches: MatchData[];
	champs: ChampionStats[];
};