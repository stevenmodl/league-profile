// app/api/cron/route.ts
import { NextResponse } from "next/server";
import { ACCOUNTS } from "@/lib/accounts";
import { refreshAccount } from "@/lib/repo";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // 60 seconds max (adjust based on your hosting plan)

export async function GET(request: Request) {
	// Optional: Add authorization header check for security
	const authHeader = request.headers.get("authorization");
	const cronSecret = process.env.CRON_SECRET;

	if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	console.log("🕐 Cron job started...");

	const results = [];

	for (const account of ACCOUNTS) {
		try {
			console.log(`\n📊 Refreshing account: ${account.slug}`);
			await refreshAccount(account.slug);

			// Revalidate the profile page for this account
			revalidatePath(`/${account.slug}`);

			results.push({ slug: account.slug, status: "success" });
		} catch (error) {
			console.error(`❌ Failed to refresh ${account.slug}:`, error);
			results.push({
				slug: account.slug,
				status: "error",
				error: error instanceof Error ? error.message : "Unknown error"
			});
		}
	}

	console.log("\n✅ Cron job completed");

	return NextResponse.json({
		success: true,
		timestamp: new Date().toISOString(),
		results
	});
}