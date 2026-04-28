import type { Metadata } from 'next';
import PackingPage from '@features/packing/pages/PackingPage';

export const metadata: Metadata = {
	title: 'Packing Your Bag',
	description:
		'Pack your bag step by step. Stay organized, avoid overpacking, and feel ready for your trip.',
	openGraph: {
		title: 'Packing Your Bag | Beggy',
		description:
			'A calm, guided way to pack everything you need without the stress.',
	},
};

type Props = {
	params: Promise<{ containerId: string }>;
};

export default async function Page({ params }: Props) {
	const { containerId } = await params;
	return <PackingPage containerId={containerId} />;
}
