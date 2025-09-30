// lib/riot.ts
import type { Platform } from "./accounts";
import { platformToRegion } from "./mapping";

const RIOT_TOKEN = process.env.RIOT_TOKEN;

if (!RIOT_TOKEN) {
	console.warn("⚠️  RIOT_TOKEN not set in environment. Riot API calls will fail.");
}

/**
 * Simple token bucket rate limiter
 */
class RateLimiter {
	private tokens: number;
	private lastRefill: number;
	private readonly capacity: number;
	private readonly refillRate: number; // tokens per second

	constructor(capacity: number, refillRate: number) {
		this.capacity = capacity;
		this.refillRate = refillRate;
		this.tokens = capacity;
		this.lastRefill = Date.now();
	}

	async acquire(): Promise<void> {
		while (true) {
			this.refill();
			if (this.tokens >= 1) {
				this.tokens -= 1;
				return;
			}
			// Wait a bit before checking again
			await new Promise(resolve => setTimeout(resolve, 100));
		}
	}

	private refill(): void {
		const now = Date.now();
		const elapsed = (now - this.lastRefill) / 1000;
		const tokensToAdd = elapsed * this.refillRate;
		this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
		this.lastRefill = now;
	}
}

// Conservative rate limiter: 20 requests per second, 100 per 2 minutes
const limiter = new RateLimiter(20, 10);

/**
 * Server-only Riot API fetch helper with rate limiting
 */
async function riotFetch<T>(url: string): Promise<T> {
	await limiter.acquire();

	const response = await fetch(url, {
		headers: {
			"X-Riot-Token": RIOT_TOKEN || ""
		}
	});

	if (!response.ok) {
		const text = await response.text();
		throw new Error(`Riot API error (${response.status}): ${text}`);
	}

	return response.json() as Promise<T>;
}

/**
 * Resolve PUUID from gameName + tagLine
 */
export async function resolvePuuid(
	platform: Platform,
	gameName: string,
	tagLine: string
): Promise<string> {
	const region = platformToRegion(platform);
	const url = `https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;

	const data = await riotFetch<{ puuid: string }>(url);
	return data.puuid;
}

/**
 * Get league entries by PUUID
 */
export async function getLeagueEntries(
	platform: Platform,
	puuid: string
): Promise<
	Array<{
		queueType: string;
		tier: string;
		rank: string;
		leaguePoints: number;
		wins: number;
		losses: number;
		hotStreak: boolean;
	}>
> {
	const url = `https://${platform}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`;
	return riotFetch<
		Array<{
			queueType: string;
			tier: string;
			rank: string;
			leaguePoints: number;
			wins: number;
			losses: number;
			hotStreak: boolean;
		}>
	>(url);
}

/**
 * Get recent match IDs for a PUUID
 */
export async function getRecentMatchIds(
	platform: Platform,
	puuid: string,
	count = 10
): Promise<string[]> {
	const region = platformToRegion(platform);
	const url = `https://${region}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${count}`;
	return riotFetch<string[]>(url);
}

/**
 * Get match details
 */
export async function getMatch(
	platform: Platform,
	matchId: string
): Promise<{
	info: {
		gameCreation: number;
		gameDuration: number;
		queueId: number;
		participants: Array<{
			puuid: string;
			championId: number;
			championName: string;
			kills: number;
			deaths: number;
			assists: number;
			win: boolean;
			totalMinionsKilled: number;
			neutralMinionsKilled: number;
			goldEarned: number;
			totalDamageDealtToChampions: number;
			teamPosition?: string;
		}>;
	};
}> {
	const region = platformToRegion(platform);
	const url = `https://${region}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
	return riotFetch(url);
}