import type { Metadata } from 'next';
import UsersPage from '@features/users/pages/UsersPage';

export const metadata: Metadata = {
	title: 'Users',
	description:
		'View and manage users. Keep things running smoothly without unnecessary complexity.',
	openGraph: {
		title: 'Users | Beggy',
		description: 'A simple overview of users and their activity.',
	},
};

export default function Page() {
	return <UsersPage />;
}
