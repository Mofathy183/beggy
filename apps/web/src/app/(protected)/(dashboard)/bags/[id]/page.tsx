import BagDetailsPage from '@features/bags/pages/BagDetailsPage';

type PageProps = {
	params: { id: string };
};

export default function Page({ params }: PageProps) {
	return <BagDetailsPage id={params.id} />;
}
