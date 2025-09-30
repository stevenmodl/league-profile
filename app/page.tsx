import { AccountSelector } from "@/components/account-selector";

export default function Home() {
	return (
		<main className="min-h-screen flex flex-col items-center justify-center p-6">
			<div className="w-full max-w-2xl space-y-8">
				<div className="text-center space-y-4">
					<h1 className="text-5xl font-bold text-balance">
						Track Your Ranked
						<span className="block text-primary mt-2">Journey</span>
					</h1>
					<p className="text-muted-foreground text-lg">
						Monitor your rank progress, match history, and champion performance
					</p>
				</div>

				<AccountSelector />
			</div>
		</main>
	);
}