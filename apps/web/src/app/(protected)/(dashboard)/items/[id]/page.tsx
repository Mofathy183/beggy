import type { Metadata } from 'next';
import ItemDetailsPage from '@features/items/pages/ItemDetailsPage';

export const metadata: Metadata = {
	title: 'Item Details',
	description:
		'View and manage your item. Adjust details and reuse it across your bags.',
	openGraph: {
		title: 'Item Details | Beggy',
		description:
			'Fine-tune your items so your packing stays accurate and stress-free.',
	},
};

type PageProps = {
	params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
	const { id } = await params;
	return <ItemDetailsPage id={id} />;
}
