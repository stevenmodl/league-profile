// lib/repo.ts
import { PrismaClient } from "@prisma/client";
import type { Account } from "./accounts";
import { ACCOUNTS } from "./accounts";
import * as riot from "./riot";
import type { ChampionStats, ProfileData } from "./types";

const prisma = new PrismaClient();

/**
 * Seed accounts: resolve PUUIDs if missing and store in DB
 */
export async function seedAccounts(): Promise<void> {
	console.log("🌱 Seeding accounts...");

	for (const acc of ACCOUNTS) {
		let puuid = acc.puuid;

		// Resolve PUUID if missing
		if (!puuid) {
			try {
				console.log(`   Resolving PUUID for ${acc.gameName}#${acc.tagLine}...`);
				puuid = await riot.resolvePuuid(acc.platform, acc.gameName, acc.tagLine);
			} catch (error) {
				console.error(`   ❌ Failed to resolve PUUID for ${acc.slug}:`, error);
				continue;
			}
		}

		// Upsert account
		await prisma.account.upsert({
			where: { slug: acc.slug },
			update: { puuid },
			create: {
				slug: acc.slug,
				gameName: acc.gameName,
				tagLine: acc.tagLine,
				platform: acc.platform,
				puuid
			}
		});

		console.log(`   ✅ Account ${acc.slug} seeded (PUUID: ${puuid.slice(0, 8)}...)`);
	}

	console.log("✅ Accounts seeded!");
}

/**
 * Refresh account data: fetch latest rank and matches
 */
export async function refreshAccount(slug: string): Promise<void> {
	const acc = ACCOUNTS.find(a => a.slug === slug);
	if (!acc) throw new Error(`Account ${slug} not found in config`);

	const dbAccount = await prisma.account.findUnique({ where: { slug } });
	if (!dbAccount) throw new Error(`Account ${slug} not found in database. Run seed first.`);

	const puuid = dbAccount.puuid;

	console.log(`🔄 Refreshing ${slug}...`);

	// Fetch league entries and save all queue types
	try {
		const leagues = await riot.getLeagueEntries(acc.platform, puuid);

		if (leagues.length > 0) {
			// Save a snapshot for each ranked queue
			for (const league of leagues) {
				await prisma.snapshot.create({
					data: {
						accountSlug: slug,
						queueType: league.queueType,
						tier: league.tier,
						rank: league.rank,
						lp: league.leaguePoints,
						wins: league.wins,
						losses: league.losses,
						hotStreak: league.hotStreak
					}
				});
				console.log(
					`   ✅ Rank snapshot: ${league.tier} ${league.rank} ${league.leaguePoints} LP (${league.queueType})`
				);
			}
		} else {
			console.log(`   ⚠️  No ranked data found for ${slug}`);
		}
	} catch (error) {
		console.error(`   ❌ Failed to fetch rank for ${slug}:`, error);
	}

	// Fetch recent matches
	try {
		const matchIds = await riot.getRecentMatchIds(acc.platform, puuid, 10);
		console.log(`   Found ${matchIds.length} recent matches`);

		for (const matchId of matchIds) {
			// Check if already processed
			const existing = await prisma.matchAgg.findUnique({
				where: { id: `${matchId}:${slug}` }
			});
			if (existing) continue;

			try {
				const match = await riot.getMatch(acc.platform, matchId);
				const participant = match.info.participants.find(p => p.puuid === puuid);
				if (!participant) continue;

				const gameDurationMin = match.info.gameDuration / 60;
				const cs = participant.totalMinionsKilled + participant.neutralMinionsKilled;
				const csPerMin = gameDurationMin > 0 ? cs / gameDurationMin : 0;
				const goldPerMin = gameDurationMin > 0 ? participant.goldEarned / gameDurationMin : 0;

				// Calculate damage share
				const totalTeamDamage = match.info.participants
					.filter(p => p.win === participant.win)
					.reduce((sum, p) => sum + p.totalDamageDealtToChampions, 0);
				const dmgShare =
					totalTeamDamage > 0 ? participant.totalDamageDealtToChampions / totalTeamDamage : null;

				await prisma.matchAgg.create({
					data: {
						id: `${matchId}:${slug}`,
						accountSlug: slug,
						matchId,
						createdAt: new Date(match.info.gameCreation),
						queueId: match.info.queueId,
						win: participant.win,
						k: participant.kills,
						d: participant.deaths,
						a: participant.assists,
						csPerMin,
						goldPerMin,
						dmgShare,
						champId: participant.championId,
						role: participant.teamPosition || null
					}
				});
			} catch (error) {
				console.error(`   ❌ Failed to process match ${matchId}:`, error);
			}
		}

		console.log(`   ✅ Matches refreshed`);
	} catch (error) {
		console.error(`   ❌ Failed to fetch matches for ${slug}:`, error);
	}
}

/**
 * Get profile data for an account
 */
export async function getProfileData(account: Account): Promise<ProfileData> {
	const { slug } = account;

	// Get latest snapshots for all queue types
	const latestSnapshots = await prisma.snapshot.findMany({
		where: { accountSlug: slug },
		orderBy: { createdAt: "desc" },
		distinct: ["queueType"]
	});

	// Prefer RANKED_SOLO_5x5, fallback to RANKED_FLEX_SR, then any other queue
	const latestSnapshot =
		latestSnapshots.find(s => s.queueType === "RANKED_SOLO_5x5") ||
		latestSnapshots.find(s => s.queueType === "RANKED_FLEX_SR") ||
		latestSnapshots[0];

	const rank = latestSnapshot
		? {
				tier: latestSnapshot.tier,
				rank: latestSnapshot.rank,
				lp: latestSnapshot.lp,
				wins: latestSnapshot.wins,
				losses: latestSnapshot.losses,
				hotStreak: latestSnapshot.hotStreak
		  }
		: null;

	// Rank history (last 30 points) - use the same queue type as the displayed rank
	const snapshots = latestSnapshot
		? await prisma.snapshot.findMany({
				where: { accountSlug: slug, queueType: latestSnapshot.queueType },
				orderBy: { createdAt: "desc" },
				take: 30
		  })
		: [];

	const rankHistory = snapshots
		.reverse()
		.map(s => ({ t: s.createdAt, tier: s.tier, rank: s.rank, lp: s.lp }));

	// Recent matches (last 10)
	const matches = await prisma.matchAgg.findMany({
		where: { accountSlug: slug },
		orderBy: { createdAt: "desc" },
		take: 10
	});

	// Get all champion data for lookups
	const allChampions = await prisma.champion.findMany();
	const championLookup = new Map(allChampions.map(c => [c.id, c.name]));

	// Champion stats
	const champMap = new Map<
		number,
		{ games: number; wins: number; kills: number; deaths: number; assists: number }
	>();
	for (const m of matches) {
		const existing = champMap.get(m.champId) || { games: 0, wins: 0, kills: 0, deaths: 0, assists: 0 };
		existing.games += 1;
		if (m.win) existing.wins += 1;
		existing.kills += m.k;
		existing.deaths += m.d;
		existing.assists += m.a;
		champMap.set(m.champId, existing);
	}

	const champs: ChampionStats[] = Array.from(champMap.entries())
		.map(([champId, stats]) => {
			const winrate = stats.games > 0 ? (stats.wins / stats.games) * 100 : 0;
			const kda =
				stats.deaths > 0 ? (stats.kills + stats.assists) / stats.deaths : stats.kills + stats.assists;
			return {
				champId,
				champName: championLookup.get(champId) || `Champion ${champId}`,
				games: stats.games,
				wins: stats.wins,
				winrate,
				kda
			};
		})
		.sort((a, b) => b.games - a.games)
		.slice(0, 5);

	// Enrich matches with champion names
	const enrichedMatches = matches.map(m => ({
		...m,
		champName: championLookup.get(m.champId) || `Champion ${m.champId}`
	}));

	return {
		updatedAt: latestSnapshot?.createdAt || new Date(),
		rank,
		rankHistory,
		matches: enrichedMatches,
		champs
	};
}

export { prisma };
