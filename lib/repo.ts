// lib/repo.ts
import { PrismaClient } from "@prisma/client";
import type { Account } from "./accounts";
import { ACCOUNTS } from "./accounts";
import { isRankedQueue, queueIdToQueueType } from "./mapping";
import * as riot from "./riot";
import type { ChampionStats, ProfileData } from "./types";

const prisma = new PrismaClient();

/**
 * Calculate LP change between two snapshots
 * Handles rank ups/downs and tier changes
 */
function calculateLPChange(
	oldSnapshot: { tier: string; rank: string; lp: number } | null,
	newSnapshot: { tier: string; rank: string; lp: number }
): number | null {
	if (!oldSnapshot) return null;

	const tierValues: Record<string, number> = {
		IRON: 0,
		BRONZE: 400,
		SILVER: 800,
		GOLD: 1200,
		PLATINUM: 1600,
		EMERALD: 2000,
		DIAMOND: 2400,
		MASTER: 2800,
		GRANDMASTER: 3200,
		CHALLENGER: 3600
	};

	const rankValues: Record<string, number> = {
		IV: 0,
		III: 100,
		II: 200,
		I: 300
	};

	// Calculate total "score" for old and new snapshots
	const oldTierBase = tierValues[oldSnapshot.tier.toUpperCase()] || 0;
	const newTierBase = tierValues[newSnapshot.tier.toUpperCase()] || 0;

	// Master+ has no divisions
	const oldRankOffset = ["MASTER", "GRANDMASTER", "CHALLENGER"].includes(oldSnapshot.tier.toUpperCase())
		? 0
		: rankValues[oldSnapshot.rank.toUpperCase()] || 0;

	const newRankOffset = ["MASTER", "GRANDMASTER", "CHALLENGER"].includes(newSnapshot.tier.toUpperCase())
		? 0
		: rankValues[newSnapshot.rank.toUpperCase()] || 0;

	const oldTotal = oldTierBase + oldRankOffset + oldSnapshot.lp;
	const newTotal = newTierBase + newRankOffset + newSnapshot.lp;

	return newTotal - oldTotal;
}

/**
 * Calculate LP change for a match by finding snapshots before/after
 * Returns null if snapshots don't exist
 */
async function calculateMatchLPChange(
	accountSlug: string,
	queueType: string,
	matchTime: Date,
	matchEndTime: Date
): Promise<number | null> {
	const snapshotBefore = await prisma.snapshot.findFirst({
		where: {
			accountSlug,
			queueType,
			createdAt: { lte: matchTime }
		},
		orderBy: { createdAt: "desc" }
	});
	if (!snapshotBefore) return null;

	const snapshotAfter = await prisma.snapshot.findFirst({
		where: {
			accountSlug,
			queueType,
			createdAt: { gte: matchEndTime }
		},
		orderBy: { createdAt: "asc" }
	});
	if (!snapshotAfter) return null;

	return calculateLPChange(
		{ tier: snapshotBefore.tier, rank: snapshotBefore.rank, lp: snapshotBefore.lp },
		{ tier: snapshotAfter.tier, rank: snapshotAfter.rank, lp: snapshotAfter.lp }
	);
}

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

	// Fetch league entries and save snapshots only if rank changed
	try {
		const leagues = await riot.getLeagueEntries(acc.platform, puuid);

		if (leagues.length > 0) {
			// Check if rank changed for each queue type before creating snapshot
			for (const league of leagues) {
				const latestSnapshot = await prisma.snapshot.findFirst({
					where: {
						accountSlug: slug,
						queueType: league.queueType
					},
					orderBy: { createdAt: "desc" }
				});

				// Only create snapshot if something changed
				const hasChanged =
					!latestSnapshot ||
					latestSnapshot.tier !== league.tier ||
					latestSnapshot.rank !== league.rank ||
					latestSnapshot.lp !== league.leaguePoints ||
					latestSnapshot.wins !== league.wins ||
					latestSnapshot.losses !== league.losses ||
					latestSnapshot.hotStreak !== league.hotStreak;

				if (hasChanged) {
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
				} else {
					console.log(`   ⏭️  No rank change for ${league.queueType}`);
				}
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

			// If match exists but lpChange is null for a ranked game, try to recalculate it
			if (existing) {
				if (existing.lpChange === null && isRankedQueue(existing.queueId)) {
					const queueType = queueIdToQueueType(existing.queueId);
					if (queueType) {
						const matchTime = new Date(existing.createdAt);
						const matchEndTime = new Date(existing.createdAt.getTime() + 30 * 60 * 1000); // Assume ~30 min match

						const lpChange = await calculateMatchLPChange(
							slug,
							queueType,
							matchTime,
							matchEndTime
						);

						// Update LP change if calculation succeeded
						if (lpChange !== null) {
							await prisma.matchAgg.update({
								where: { id: existing.id },
								data: { lpChange }
							});

							console.log(
								`   ✅ Updated LP change for match ${matchId}: ${
									lpChange > 0 ? "+" : ""
								}${lpChange} LP`
							);
						}
					}
				}
				continue;
			}

			try {
				const match = await riot.getMatch(acc.platform, matchId);
				const participant = match.info.participants.find(p => p.puuid === puuid);
				if (!participant) continue;

				const matchTime = new Date(match.info.gameCreation);
				const matchEndTime = new Date(match.info.gameCreation + match.info.gameDuration * 1000);

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

				// Calculate LP change for ranked matches by comparing snapshots
				// If snapshots don't exist yet, lpChange will be null and recalculated on next cron run
				let lpChange: number | null = null;
				if (isRankedQueue(match.info.queueId)) {
					const queueType = queueIdToQueueType(match.info.queueId);
					if (queueType) {
						lpChange = await calculateMatchLPChange(slug, queueType, matchTime, matchEndTime);
					}
				}

				await prisma.matchAgg.create({
					data: {
						id: `${matchId}:${slug}`,
						accountSlug: slug,
						matchId,
						createdAt: matchTime,
						queueId: match.info.queueId,
						win: participant.win,
						k: participant.kills,
						d: participant.deaths,
						a: participant.assists,
						csPerMin,
						goldPerMin,
						dmgShare,
						champId: participant.championId,
						role: participant.teamPosition || null,
						lpChange
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
