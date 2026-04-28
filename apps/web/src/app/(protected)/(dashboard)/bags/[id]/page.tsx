import type { Metadata } from 'next';
import BagDetailsPage from '@features/bags/pages/BagDetailsPage';

export const metadata: Metadata = {
	title: 'Bag Details',
	description:
		'Manage your bag, track your packing progress, and make sure you’re ready for your trip.',
	openGraph: {
		title: 'Bag Details | Beggy',
		description:
			'Stay on top of your packing. See what’s in your bag and what’s left to add.',
	},
};

type PageProps = {
	params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
	const { id } = await params;
	return <BagDetailsPage id={id} />;
}
