import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import Image from "next/image";

interface RankCardProps {
	rank: string;
	lp: number;
	wins: number;
	losses: number;
	winRate: number;
}

export function RankCard({ rank, lp, wins, losses, winRate }: RankCardProps) {
	const totalGames = wins + losses;

	return (
		<Card className="bg-card border-border h-full">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-foreground">
					<Trophy className="h-5 w-5 text-primary" />
					Ranked Solo/Duo
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Rank Display */}
				<div className="flex items-center gap-6">
					<div className="flex-shrink-0">
						<Image
							src="/league-of-legends-rank-emblem-gold.jpg"
							alt={`${rank} rank emblem`}
							width={96}
							height={96}
							className="rounded-lg"
						/>
					</div>
					<div className="space-y-1">
						<div className="text-4xl font-bold text-primary">{rank}</div>
						<div className="text-xl font-semibold text-foreground">{lp} LP</div>
					</div>
				</div>

				{/* Stats */}
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground">Win Rate</span>
						<span className="text-lg font-semibold text-accent">{winRate}%</span>
					</div>

					<div className="flex items-center justify-between">
						<span className="text-muted-foreground">Total Games</span>
						<span className="text-lg font-semibold text-foreground">{totalGames}</span>
					</div>

					<div className="flex items-center justify-between">
						<span className="text-muted-foreground">Wins / Losses</span>
						<span className="text-lg font-semibold">
							<span className="text-accent">{wins}</span>
							<span className="text-muted-foreground mx-1">/</span>
							<span className="text-destructive">{losses}</span>
						</span>
					</div>
				</div>

				{/* Win Rate Bar */}
				<div className="space-y-2">
					<div className="h-2 bg-secondary rounded-full overflow-hidden">
						<div
							className="h-full bg-accent rounded-full transition-all"
							style={{ width: `${winRate}%` }}
						/>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
