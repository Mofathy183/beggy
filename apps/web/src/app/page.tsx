import { Button } from '@shadcn-ui/button';
import { ThemeToggle } from '@shadcn-components';

export default function Page() {
	return (
		<main className="min-h-screen p-8">
			<div className="flex justify-end">
				<ThemeToggle />
			</div>
			<div className="max-w-6xl mx-auto space-y-6">
				<header className="space-y-2">
					<h1 className="text-3xl font-bold">Beggy</h1>
					<p className="text-muted-foreground">
						Discover the perfect bag for your journey.
					</p>
				</header>

				<section className="flex gap-4">
					<Button>Browse Bags</Button>
					<Button variant="outline">Add New Bag</Button>
				</section>
			</div>
		</main>
	);
}
