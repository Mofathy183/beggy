'use client';

import { Button } from '@shadcn-ui/button';
import { ThemeToggle } from '@shared/ui/theme';
import { notify } from '@/shared/utils';
type TriggerButtonProps = {
	label: string;
	onClick: () => void;
};
function TriggerButton({ label, onClick }: TriggerButtonProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={[
				'inline-flex items-center gap-2',
				'px-4 py-2 rounded-lg',
				'text-sm font-medium font-serif',
				'transition-colors cursor-pointer',
			].join(' ')}
		>
			{label}
		</button>
	);
}

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

					<section className="flex flex-col gap-3">
						<TriggerButton
							label="Item added to bag"
							onClick={() =>
								notify.success({
									message: 'Added to your bag!',
									description:
										'You can review it anytime in your packing list.',
								})
							}
						/>

						<TriggerButton
							label="Save failed"
							onClick={() =>
								notify.error({
									message:
										"Couldn't save your bag right now.",
									suggestion:
										'Check your connection and give it another go.',
								})
							}
						/>

						<TriggerButton
							label="Near weight limit"
							onClick={() =>
								notify.warning({
									message: 'Almost at the weight limit',
									description:
										'You have about 200g left — pack the lighter stuff last.',
								})
							}
						/>

						<TriggerButton
							label="Packing tip"
							onClick={() =>
								notify.info({
									message:
										'Pro tip: add items to your library first',
									description:
										'Library items can be quickly dropped into any bag.',
								})
							}
						/>
					</section>
				</section>
			</div>
		</main>
	);
}
