import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Swords } from "lucide-react";
import type { ChampionStats as ChampionStatsType } from "@/lib/types";

interface ChampionStatsProps {
	champs: ChampionStatsType[];
}

export function ChampionStats({ champs }: ChampionStatsProps) {
	if (champs.length === 0) {
		return (
			<Card className="bg-card border-border">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-foreground">
						<Swords className="h-5 w-5 text-primary" />
						Top Champions
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center text-muted-foreground py-8">
						<p>No champion data available yet</p>
					</div>
				</CardContent>
			</Card>
		);
	}
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
					{champs.map((champion, index) => {
						const losses = champion.games - champion.wins;
						return (
							<div
								key={champion.champId}
								className="flex items-center gap-4 p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
							>
								{/* Rank */}
								<div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary/10 text-primary font-bold rounded">
									{index + 1}
								</div>

								{/* Champion Name */}
								<div className="flex-1 min-w-0">
									<div className="font-semibold text-foreground">Champion {champion.champId}</div>
									<div className="text-sm text-muted-foreground">{champion.games} games</div>
								</div>

								{/* Stats */}
								<div className="flex items-center gap-6">
									{champion.kda !== undefined && (
										<div className="text-center">
											<div className="text-sm text-muted-foreground">KDA</div>
											<div className="font-semibold text-foreground">{champion.kda.toFixed(1)}</div>
										</div>
									)}

									<div className="text-center">
										<div className="text-sm text-muted-foreground">Win Rate</div>
										<div className="font-semibold text-accent">{champion.winrate.toFixed(1)}%</div>
									</div>

									<div className="text-center min-w-[80px]">
										<div className="text-sm text-muted-foreground">W / L</div>
										<div className="font-semibold">
											<span className="text-accent">{champion.wins}</span>
											<span className="text-muted-foreground mx-1">/</span>
											<span className="text-destructive">{losses}</span>
										</div>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}
