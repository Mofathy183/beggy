import ItemDetailsPage from '@features/items/pages/ItemDetailsPage';

type PageProps = {
	params: { id: string };
};

export default function Page({ params }: PageProps) {
	return <ItemDetailsPage id={params.id} />;
}
