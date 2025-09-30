import { AccountSelector } from "@/components/account-selector";

export default function Home() {
	return (
		<main className="min-h-screen flex flex-col items-center justify-center p-6">
			<div className="w-full max-w-2xl space-y-8">
				<div className="text-center space-y-4">
					<h1 className="text-5xl font-bold text-balance">
						League of Legends
						<span className="block text-primary mt-2">Profile Dashboard</span>
					</h1>
					<p className="text-muted-foreground text-lg">
						View detailed statistics and performance metrics for your accounts
					</p>
				</div>

				<AccountSelector />
			</div>
		</main>
	);
}