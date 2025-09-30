"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { RankHistoryPoint } from "@/lib/types";
import { format } from "date-fns";

interface HistoryGraphProps {
	rankHistory: RankHistoryPoint[];
}

// Convert tier + rank + LP to a continuous numeric scale
function rankToScale(tier: string, rank: string, lp: number): number {
	const tierValues: Record<string, number> = {
		IRON: 0,
		BRONZE: 400,
		SILVER: 800,
		GOLD: 1200,
		PLATINUM: 1600,
		EMERALD: 2000,
		DIAMOND: 2400,
		MASTER: 2800,
		GRANDMASTER: 3200,
		CHALLENGER: 3600
	};

	const rankValues: Record<string, number> = {
		IV: 0,
		III: 100,
		II: 200,
		I: 300
	};

	const tierBase = tierValues[tier.toUpperCase()] || 0;
	// Master+ has no divisions, just LP
	const rankOffset = ["MASTER", "GRANDMASTER", "CHALLENGER"].includes(tier.toUpperCase())
		? 0
		: rankValues[rank.toUpperCase()] || 0;

	return tierBase + rankOffset + lp;
}

export function HistoryGraph({ rankHistory }: HistoryGraphProps) {
	const data = rankHistory.map(point => ({
		date: format(new Date(point.t), "MMM d"),
		value: rankToScale(point.tier, point.rank, point.lp),
		tier: point.tier,
		rank: point.rank,
		lp: point.lp,
		fullDate: format(new Date(point.t), "PPP")
	}));

	if (data.length < 3) {
		return (
			<Card className="bg-card border-border h-full">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-foreground">
						<TrendingUp className="h-5 w-5 text-accent" />
						Rank History
					</CardTitle>
				</CardHeader>
				<CardContent className="flex items-center justify-center h-48">
					<p className="text-muted-foreground">No history data available yet</p>
				</CardContent>
			</Card>
		);
	}

	// Custom tooltip to show actual rank
	const CustomTooltip = ({ active, payload }: any) => {
		if (active && payload && payload.length) {
			const data = payload[0].payload;
			const tierLabel = data.tier.charAt(0) + data.tier.slice(1).toLowerCase();
			const rankLabel = ["MASTER", "GRANDMASTER", "CHALLENGER"].includes(data.tier.toUpperCase())
				? ""
				: ` ${data.rank}`;

			return (
				<div className="bg-[#1a2332] border border-[#1e293b] rounded-lg p-3">
					<p className="text-[#94a3b8] text-sm mb-1">{data.fullDate}</p>
					<p className="text-[#f1f5f9] font-semibold">
						{tierLabel}
						{rankLabel} - {data.lp} LP
					</p>
				</div>
			);
		}
		return null;
	};

	return (
		<Card className="bg-card border-border h-full">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-foreground">
					<TrendingUp className="h-5 w-5 text-accent" />
					Rank History ({data.length} snapshots)
				</CardTitle>
			</CardHeader>
			<CardContent>
				<ResponsiveContainer width="100%" height={300}>
					<LineChart data={data}>
						<CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
						<XAxis
							dataKey="date"
							stroke="#94a3b8"
							tick={{ fill: "#94a3b8" }}
							tickLine={{ stroke: "#1e293b" }}
						/>
						<YAxis hide domain={["dataMin - 50", "dataMax + 50"]} />
						<Tooltip content={<CustomTooltip />} />
						<Line
							type="monotone"
							dataKey="value"
							stroke="#c8aa6e"
							strokeWidth={3}
							dot={{ fill: "#c8aa6e", r: 4 }}
							activeDot={{ r: 6 }}
						/>
					</LineChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	);
}
