import type { Metadata } from 'next';
import UserDetailsPage from '@features/users/pages/UserDetailsPage';

export const metadata: Metadata = {
	title: 'User Details',
	description:
		'View user details, activity, and related data in a simple, clear way.',
};

type PageProps = {
	params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
	const { id } = await params;
	return <UserDetailsPage id={id} />;
}
