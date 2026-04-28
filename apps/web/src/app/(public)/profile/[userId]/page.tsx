import type { Metadata } from 'next';
import { PublicProfilePage } from '@features/profiles/pages';

export const metadata: Metadata = {
	title: 'Traveler Profile',
	description: 'See how others pack and prepare for their trips.',
};

interface Props {
	params: { userId: string };
}

export default function Page({ params }: Props) {
	return <PublicProfilePage userId={params.userId} />;
}
