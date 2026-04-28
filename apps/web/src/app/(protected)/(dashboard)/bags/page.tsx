import type { Metadata } from 'next';
import BagsPage from '@features/bags/pages/BagsPage';

export const metadata: Metadata = {
	title: 'Your Bags',
	description:
		'See all your bags in one place. Create, organize, and get ready for your next trip without the stress.',
	openGraph: {
		title: 'Your Bags | Beggy',
		description:
			'Keep your packing simple. Manage your bags and get ready for your next trip with confidence.',
	},
};

export default function Page() {
	return <BagsPage />;
}
