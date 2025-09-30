// lib/champions.ts
import { prisma } from "./repo";

const DDRAGON_BASE = "https://ddragon.leagueoflegends.com/cdn";

/**
 * Get the latest Data Dragon version
 */
async function getLatestVersion(): Promise<string> {
	const res = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
	const versions = (await res.json()) as string[];
	return versions[0]; // Latest version
}

/**
 * Fetch and store all champion data from Data Dragon
 */
export async function fetchAndStoreChampions(): Promise<void> {
	console.log("🎮 Fetching champion data from Data Dragon...");

	try {
		const version = await getLatestVersion();
		console.log(`   Using Data Dragon version: ${version}`);

		const url = `${DDRAGON_BASE}/${version}/data/en_US/champion.json`;
		const res = await fetch(url);
		const data = (await res.json()) as {
			data: Record<
				string,
				{
					key: string; // Champion ID as string
					id: string; // Champion key (e.g., "Annie")
					name: string; // Champion name (e.g., "Annie")
					title: string; // Champion title (e.g., "the Dark Child")
					image: { full: string };
				}
			>;
		};

		const champions = Object.values(data.data);
		console.log(`   Found ${champions.length} champions`);

		// Upsert all champions
		for (const champ of champions) {
			const championId = parseInt(champ.key);
			const imageUrl = `${DDRAGON_BASE}/${version}/img/champion/${champ.image.full}`;

			await prisma.champion.upsert({
				where: { id: championId },
				update: {
					key: champ.id,
					name: champ.name,
					title: champ.title,
					imageUrl,
					updatedAt: new Date()
				},
				create: {
					id: championId,
					key: champ.id,
					name: champ.name,
					title: champ.title,
					imageUrl
				}
			});
		}

		console.log(`   ✅ ${champions.length} champions stored in database`);
	} catch (error) {
		console.error("   ❌ Failed to fetch champion data:", error);
		throw error;
	}
}

/**
 * Get champion name by ID (lookup from database)
 */
export async function getChampionName(championId: number): Promise<string> {
	const champion = await prisma.champion.findUnique({
		where: { id: championId }
	});
	return champion?.name || `Champion ${championId}`;
}

/**
 * Get all champions as a map (for batch lookups)
 */
export async function getChampionMap(): Promise<Map<number, { name: string; imageUrl: string }>> {
	const champions = await prisma.champion.findMany();
	const map = new Map<number, { name: string; imageUrl: string }>();

	for (const champ of champions) {
		map.set(champ.id, {
			name: champ.name,
			imageUrl: champ.imageUrl
		});
	}

	return map;
}