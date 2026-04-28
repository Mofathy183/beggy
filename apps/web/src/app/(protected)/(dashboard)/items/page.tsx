import type { Metadata } from 'next';
import ItemsPage from '@features/items/pages/ItemsPage';

export const metadata: Metadata = {
	title: 'Your Items',
	description:
		'Keep track of everything you might pack. Organize your items and reuse them across trips with ease.',
	openGraph: {
		title: 'Your Items | Beggy',
		description:
			'Build your personal packing list once, and reuse it anytime you travel.',
	},
};

export default function Page() {
	return <ItemsPage />;
}
