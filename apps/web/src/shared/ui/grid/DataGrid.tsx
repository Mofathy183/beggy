import { cn } from '@shared/lib/utils';

type DataGridProps = {
	children: React.ReactNode;
	isLoading?: boolean;
	empty?: React.ReactNode;
	className?: string;
};

const DataGrid = ({
	children,
	isLoading = false,
	empty,
	className,
}: DataGridProps) => {
	const hasItems = Array.isArray(children) && children.length > 0;

	if (!isLoading && !hasItems && empty) {
		return <>{empty}</>;
	}

	return (
		<div
			className={cn(
				`
        grid
        gap-6
        grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-3
        xl:grid-cols-4
        `,
				className
			)}
		>
			{children}
		</div>
	);
};

export default DataGrid;
