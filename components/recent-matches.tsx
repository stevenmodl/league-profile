import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

// Mock match data
const matches = [
	{
		id: "1",
		champion: "Ahri",
		result: "Victory",
		kda: "12/3/8",
		duration: "28:45",
		gameMode: "Ranked Solo",
		timestamp: "2 hours ago"
	},
	{
		id: "2",
		champion: "Zed",
		result: "Defeat",
		kda: "8/7/5",
		duration: "32:12",
		gameMode: "Ranked Solo",
		timestamp: "5 hours ago"
	},
	{
		id: "3",
		champion: "Yasuo",
		result: "Victory",
		kda: "15/4/10",
		duration: "35:20",
		gameMode: "Ranked Solo",
		timestamp: "8 hours ago"
	},
	{
		id: "4",
		champion: "LeBlanc",
		result: "Victory",
		kda: "10/2/12",
		duration: "26:33",
		gameMode: "Ranked Solo",
		timestamp: "1 day ago"
	},
	{
		id: "5",
		champion: "Syndra",
		result: "Defeat",
		kda: "6/8/7",
		duration: "38:15",
		gameMode: "Ranked Solo",
		timestamp: "1 day ago"
	}
];

export function RecentMatches() {
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
					{matches.map(match => (
						<div
							key={match.id}
							className={`flex items-center gap-4 p-4 rounded-lg border-l-4 ${
								match.result === "Victory"
									? "bg-accent/5 border-accent"
									: "bg-destructive/5 border-destructive"
							}`}
						>
							{/* Champion & Result */}
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-3">
									<div className="font-semibold text-foreground">{match.champion}</div>
									<div
										className={`text-sm font-medium ${
											match.result === "Victory" ? "text-accent" : "text-destructive"
										}`}
									>
										{match.result}
									</div>
								</div>
								<div className="text-sm text-muted-foreground mt-1">
									{match.gameMode} • {match.timestamp}
								</div>
							</div>

							{/* KDA */}
							<div className="text-center">
								<div className="text-sm text-muted-foreground">KDA</div>
								<div className="font-semibold text-foreground">{match.kda}</div>
							</div>

							{/* Duration */}
							<div className="text-center min-w-[80px]">
								<div className="text-sm text-muted-foreground">Duration</div>
								<div className="font-semibold text-foreground">{match.duration}</div>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
