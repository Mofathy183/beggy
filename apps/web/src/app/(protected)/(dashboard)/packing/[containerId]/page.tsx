import PackingPage from '@features/packing/pages/PackingPage';

type Props = {
	params: Promise<{ containerId: string }>;
};

export default async function Page({ params }: Props) {
	const { containerId } = await params;
	return <PackingPage containerId={containerId} />;
}
