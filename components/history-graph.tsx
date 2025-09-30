"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Mock data for rank progression over last 30 days
const data = [
	{ day: "Day 1", lp: 1050 },
	{ day: "Day 3", lp: 1075 },
	{ day: "Day 5", lp: 1100 },
	{ day: "Day 7", lp: 1085 },
	{ day: "Day 9", lp: 1120 },
	{ day: "Day 11", lp: 1145 },
	{ day: "Day 13", lp: 1130 },
	{ day: "Day 15", lp: 1160 },
	{ day: "Day 17", lp: 1180 },
	{ day: "Day 19", lp: 1195 },
	{ day: "Day 21", lp: 1210 },
	{ day: "Day 23", lp: 1225 },
	{ day: "Day 25", lp: 1215 },
	{ day: "Day 27", lp: 1235 },
	{ day: "Day 30", lp: 1247 }
];

export function HistoryGraph() {
	return (
		<Card className="bg-card border-border h-full">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-foreground">
					<TrendingUp className="h-5 w-5 text-accent" />
					LP History (Last 30 Days)
				</CardTitle>
			</CardHeader>
			<CardContent>
				<ResponsiveContainer width="100%" height={300}>
					<LineChart data={data}>
						<CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
						<XAxis
							dataKey="day"
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
