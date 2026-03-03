import { PublicProfilePage } from '@features/profiles/pages';

interface Props {
	params: { userId: string };
}

export default function Page({ params }: Props) {
	return <PublicProfilePage userId={params.userId} />;
}
