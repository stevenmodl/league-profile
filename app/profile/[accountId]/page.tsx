import { RankCard } from "@/components/rank-card";
import { HistoryGraph } from "@/components/history-graph";
import { ChampionStats } from "@/components/champion-stats";
import { RecentMatches } from "@/components/recent-matches";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

// Mock data
const MOCK_DATA = {
	"1": {
		name: "Faker",
		tag: "KR1",
		region: "KR",
		rank: "Challenger",
		lp: 1247,
		wins: 342,
		losses: 298,
		winRate: 53.4
	},
	"2": {
		name: "Doublelift",
		tag: "NA1",
		region: "NA",
		rank: "Grandmaster",
		lp: 876,
		wins: 245,
		losses: 231,
		winRate: 51.5
	},
	"3": {
		name: "Rekkles",
		tag: "EUW1",
		region: "EUW",
		rank: "Master",
		lp: 543,
		wins: 198,
		losses: 187,
		winRate: 51.4
	}
};

export default function ProfilePage({ params }: { params: { accountId: string } }) {
	const account = MOCK_DATA[params.accountId as keyof typeof MOCK_DATA] || MOCK_DATA["1"];

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
						{account.name}
						<span className="text-muted-foreground text-2xl ml-2">#{account.tag}</span>
					</h1>
					<p className="text-muted-foreground">{account.region} Server</p>
				</div>

				{/* Stats Grid */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Rank Card */}
					<div className="lg:col-span-1">
						<RankCard
							rank={account.rank}
							lp={account.lp}
							wins={account.wins}
							losses={account.losses}
							winRate={account.winRate}
						/>
					</div>

					{/* History Graph */}
					<div className="lg:col-span-2">
						<HistoryGraph />
					</div>
				</div>

				{/* Champion Stats */}
				<ChampionStats />

				{/* Recent Matches */}
				<RecentMatches />
			</div>
		</main>
	);
}
