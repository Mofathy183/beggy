import type { Metadata } from 'next';
import DashboardPage from '@features/dashboard/pages/DashboardPage';

export const metadata: Metadata = {
	title: 'Your Trip Dashboard',
	description:
		'Stay on top of your trip. See your bags, packing progress, and what still needs your attention.',
	openGraph: {
		title: 'Your Trip Dashboard | Beggy',
		description:
			'A simple overview of your packing progress so you can travel with confidence.',
	},
};

export default function Page() {
	return <DashboardPage />;
}
