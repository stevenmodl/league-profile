import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Swords } from "lucide-react";

// Mock champion data
const champions = [
	{ name: "Ahri", games: 45, wins: 28, losses: 17, kda: "4.2", winRate: 62.2 },
	{ name: "Zed", games: 38, wins: 22, losses: 16, kda: "3.8", winRate: 57.9 },
	{ name: "Yasuo", games: 32, wins: 18, losses: 14, kda: "3.5", winRate: 56.3 }
];

export function ChampionStats() {
	return (
		<Card className="bg-card border-border">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-foreground">
					<Swords className="h-5 w-5 text-primary" />
					Top Champions
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{champions.map((champion, index) => (
						<div
							key={champion.name}
							className="flex items-center gap-4 p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
						>
							{/* Rank */}
							<div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary/10 text-primary font-bold rounded">
								{index + 1}
							</div>

							{/* Champion Name */}
							<div className="flex-1 min-w-0">
								<div className="font-semibold text-foreground">{champion.name}</div>
								<div className="text-sm text-muted-foreground">{champion.games} games</div>
							</div>

							{/* Stats */}
							<div className="flex items-center gap-6">
								<div className="text-center">
									<div className="text-sm text-muted-foreground">KDA</div>
									<div className="font-semibold text-foreground">{champion.kda}</div>
								</div>

								<div className="text-center">
									<div className="text-sm text-muted-foreground">Win Rate</div>
									<div className="font-semibold text-accent">{champion.winRate}%</div>
								</div>

								<div className="text-center min-w-[80px]">
									<div className="text-sm text-muted-foreground">W / L</div>
									<div className="font-semibold">
										<span className="text-accent">{champion.wins}</span>
										<span className="text-muted-foreground mx-1">/</span>
										<span className="text-destructive">{champion.losses}</span>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
