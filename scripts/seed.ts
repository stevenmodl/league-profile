// scripts/seed.ts
import { seedAccounts, refreshAccount } from "../lib/repo";
import { fetchAndStoreChampions } from "../lib/champions";
import { ACCOUNTS } from "../lib/accounts";

async function main() {
	console.log("🚀 Starting seed process...\n");

	// Step 1: Fetch and store champion data
	await fetchAndStoreChampions();

	console.log("\n");

	// Step 2: Seed accounts (resolve PUUIDs)
	await seedAccounts();

	console.log("\n");

	// Step 3: Refresh each account (fetch rank & matches)
	for (const acc of ACCOUNTS) {
		try {
			await refreshAccount(acc.slug);
			console.log("");
		} catch (error) {
			console.error(`❌ Failed to refresh ${acc.slug}:`, error);
		}
	}

	console.log("✨ Seed complete!");
	process.exit(0);
}

main().catch(error => {
	console.error("Fatal error:", error);
	process.exit(1);
});