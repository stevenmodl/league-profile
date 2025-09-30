"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ACCOUNTS } from "@/lib/accounts";

export function AccountSelector() {
	const [searchQuery, setSearchQuery] = useState("");
	const router = useRouter();

	const filteredAccounts = ACCOUNTS.filter(
		account =>
			account.gameName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			account.tagLine.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const handleSelectAccount = (slug: string) => {
		router.push(`/${slug}`);
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
							key={account.slug}
							onClick={() => handleSelectAccount(account.slug)}
							className="w-full px-4 py-3 flex items-center justify-between hover:bg-secondary/50 transition-colors text-left"
						>
							<div className="space-y-1">
								<div className="font-semibold text-foreground">{account.gameName}</div>
								<div className="text-sm text-muted-foreground">#{account.tagLine}</div>
							</div>
							<div className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
								{account.platform.toUpperCase()}
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