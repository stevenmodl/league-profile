"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { RankHistoryPoint } from "@/lib/types";
import { format } from "date-fns";

interface HistoryGraphProps {
	rankHistory: RankHistoryPoint[];
}

export function HistoryGraph({ rankHistory }: HistoryGraphProps) {
	const data = rankHistory.map(point => ({
		date: format(new Date(point.t), "MMM d"),
		lp: point.lp,
		fullDate: format(new Date(point.t), "PPP")
	}));

	if (data.length === 0) {
		return (
			<Card className="bg-card border-border h-full">
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-foreground">
						<TrendingUp className="h-5 w-5 text-accent" />
						LP History
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center text-muted-foreground py-8">
						<p>No history data available yet</p>
					</div>
				</CardContent>
			</Card>
		);
	}
	return (
		<Card className="bg-card border-border h-full">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-foreground">
					<TrendingUp className="h-5 w-5 text-accent" />
					LP History ({data.length} snapshots)
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
						<YAxis
							stroke="#94a3b8"
							tick={{ fill: "#94a3b8" }}
							tickLine={{ stroke: "#1e293b" }}
							domain={["dataMin - 50", "dataMax + 50"]}
						/>
						<Tooltip
							contentStyle={{
								backgroundColor: "#1a2332",
								border: "1px solid #1e293b",
								borderRadius: "0.5rem",
								color: "#f1f5f9"
							}}
							labelStyle={{ color: "#94a3b8" }}
						/>
						<Line
							type="monotone"
							dataKey="lp"
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
