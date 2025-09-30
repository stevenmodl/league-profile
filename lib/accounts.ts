// lib/accounts.ts
export type Platform = "euw1" | "eun1" | "na1" | "kr" | "br1" | "jp1" | "oc1" | "tr1" | "ru" | "la1" | "la2";

export type Account = {
	slug: string;
	gameName: string;
	tagLine: string;
	platform: Platform;
	puuid?: string; // filled on first seed if missing
};

// Define your static accounts here
export const ACCOUNTS: Account[] = [
	{ slug: "gamingmaster", gameName: "GamingMaster", tagLine: "0000", platform: "euw1" },
	{ slug: "gazura", gameName: "Gazura", tagLine: "EUW", platform: "euw1" }
	// { slug: "smurf-1", gameName: "YourSmurf", tagLine: "EUW", platform: "euw1" }
];

export const bySlug = new Map(ACCOUNTS.map(a => [a.slug, a]));
