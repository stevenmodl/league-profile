"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

// Mock accounts for demonstration
const MOCK_ACCOUNTS = [
	{ id: "1", name: "Faker", tag: "KR1", region: "KR" },
	{ id: "2", name: "Doublelift", tag: "NA1", region: "NA" },
	{ id: "3", name: "Rekkles", tag: "EUW1", region: "EUW" },
	{ id: "4", name: "TheShy", tag: "CN1", region: "CN" },
	{ id: "5", name: "Caps", tag: "EUW1", region: "EUW" }
];

export function AccountSelector() {
	const [searchQuery, setSearchQuery] = useState("");
	const router = useRouter();

	const filteredAccounts = MOCK_ACCOUNTS.filter(
		account =>
			account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			account.tag.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const handleSelectAccount = (accountId: string) => {
		router.push(`/profile/${accountId}`);
	};

	return (
		<div className="space-y-4">
			<div className="relative">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
				<Input
					type="text"
					placeholder="Search summoner name or tag..."
					value={searchQuery}
					onChange={e => setSearchQuery(e.target.value)}
					className="pl-10 h-12 bg-card border-border text-foreground placeholder:text-muted-foreground"
				/>
			</div>

			<div className="bg-card rounded-lg border border-border divide-y divide-border">
				{filteredAccounts.length > 0 ? (
					filteredAccounts.map(account => (
						<button
							key={account.id}
							onClick={() => handleSelectAccount(account.id)}
							className="w-full px-4 py-3 flex items-center justify-between hover:bg-secondary/50 transition-colors text-left"
						>
							<div className="space-y-1">
								<div className="font-semibold text-foreground">{account.name}</div>
								<div className="text-sm text-muted-foreground">#{account.tag}</div>
							</div>
							<div className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
								{account.region}
							</div>
						</button>
					))
				) : (
					<div className="px-4 py-8 text-center text-muted-foreground">No accounts found</div>
				)}
			</div>
		</div>
	);
}
