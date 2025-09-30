// app/[slug]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ACCOUNTS, bySlug } from "@/lib/accounts";
import { getProfileData } from "@/lib/repo";
import { RankCard } from "@/components/rank-card";
import { HistoryGraph } from "@/components/history-graph";
import { ChampionStats } from "@/components/champion-stats";
import { RecentMatches } from "@/components/recent-matches";

// Enable ISR with 10-minute revalidation
export const revalidate = 600;

// Generate static params for all accounts
export async function generateStaticParams() {
	return ACCOUNTS.map(account => ({
		slug: account.slug
	}));
}

type Props = {
	params: Promise<{ slug: string }>;
};

export default async function ProfilePage({ params }: Props) {
	const { slug } = await params;
	const account = bySlug.get(slug);

	if (!account) {
		notFound();
	}

	// Fetch profile data
	const data = await getProfileData(account);

	return (
		<main className="min-h-screen p-6">
			<div className="max-w-7xl mx-auto space-y-6">
				{/* Header */}
				<div className="flex items-center gap-4">
					<Link
						href="/"
						className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
					>
						<ArrowLeft className="h-5 w-5" />
						<span>Back</span>
					</Link>
				</div>

				{/* Profile Header */}
				<div className="space-y-2">
					<h1 className="text-4xl font-bold text-foreground">
						{account.gameName}
						<span className="text-muted-foreground text-2xl ml-2">#{account.tagLine}</span>
					</h1>
					<p className="text-muted-foreground">{account.platform.toUpperCase()} Server</p>
				</div>

				{/* Stats Grid */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Rank Card */}
					<div className="lg:col-span-1">
						<RankCard rank={data.rank} />
					</div>

					{/* History Graph */}
					<div className="lg:col-span-2">
						<HistoryGraph rankHistory={data.rankHistory} />
					</div>
				</div>

				{/* Champion Stats */}
				<ChampionStats champs={data.champs} />

				{/* Recent Matches */}
				<RecentMatches matches={data.matches} />
			</div>
		</main>
	);
}