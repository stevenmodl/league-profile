// lib/mapping.ts
import type { Platform } from "./accounts";

export type Region = "europe" | "americas" | "asia" | "sea";

/**
 * Maps platform (routing value) to regional endpoint for match-v5 API
 */
export function platformToRegion(platform: Platform): Region {
	switch (platform) {
		case "euw1":
		case "eun1":
		case "tr1":
		case "ru":
			return "europe";
		case "na1":
		case "br1":
		case "la1":
		case "la2":
			return "americas";
		case "kr":
		case "jp1":
			return "asia";
		case "oc1":
			return "sea";
		default:
			return "americas";
	}
}

/**
 * Queue ID to human-readable name mapping
 */
export function queueIdToName(queueId: number): string {
	const queues: Record<number, string> = {
		420: "Ranked Solo/Duo",
		440: "Ranked Flex",
		400: "Normal Draft",
		430: "Normal Blind",
		450: "ARAM",
		700: "Clash"
	};
	return queues[queueId] || "Custom";
}

/**
 * Tier + Rank to display string
 */
export function formatRank(tier: string, rank: string): string {
	if (tier === "MASTER" || tier === "GRANDMASTER" || tier === "CHALLENGER") {
		return tier.charAt(0) + tier.slice(1).toLowerCase();
	}
	return `${tier.charAt(0) + tier.slice(1).toLowerCase()} ${rank}`;
}