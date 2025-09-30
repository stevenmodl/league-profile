import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import type { MatchData } from "@/lib/types";
import { queueIdToName } from "@/lib/mapping";
import { formatDistanceToNow } from "date-fns";

interface RecentMatchesProps {
	matches: MatchData[];
}

export function RecentMatches({ matches }: RecentMatchesProps) {
	if (matches.length === 0) {
		return (
			<Card className="bg-card border-border">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-foreground">
						<Clock className="h-5 w-5 text-primary" />
						Recent Matches
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center text-muted-foreground py-8">
						<p>No match data available yet</p>
					</div>
				</CardContent>
			</Card>
		);
	}
	return (
		<Card className="bg-card border-border">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-foreground">
					<Clock className="h-5 w-5 text-primary" />
					Recent Matches
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{matches.map(match => {
						const kda = `${match.k}/${match.d}/${match.a}`;
						const timestamp = formatDistanceToNow(new Date(match.createdAt), { addSuffix: true });
						const queueName = queueIdToName(match.queueId);

						return (
							<div
								key={match.id}
								className={`flex items-center gap-4 p-4 rounded-lg border-l-4 ${
									match.win ? "bg-accent/5 border-accent" : "bg-destructive/5 border-destructive"
								}`}
							>
								{/* Champion & Result */}
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-3">
										<div className="font-semibold text-foreground">{match.champName}</div>
										<div
											className={`text-sm font-medium ${
												match.win ? "text-accent" : "text-destructive"
											}`}
										>
											{match.win ? "Victory" : "Defeat"}
										</div>
									</div>
									<div className="text-sm text-muted-foreground mt-1">
										{queueName} • {timestamp}
									</div>
								</div>

								{/* KDA */}
								<div className="text-center">
									<div className="text-sm text-muted-foreground">KDA</div>
									<div className="font-semibold text-foreground">{kda}</div>
								</div>

								{/* Stats */}
								<div className="text-center min-w-[100px]">
									<div className="text-sm text-muted-foreground">CS/min • Gold/min</div>
									<div className="font-semibold text-foreground">
										{match.csPerMin.toFixed(1)} • {match.goldPerMin.toFixed(0)}
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
