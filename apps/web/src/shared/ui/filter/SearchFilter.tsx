import { useEffect, useState } from 'react';
import { Input } from '@shadcn-ui/input';
import { Label } from '@shadcn-ui/label';
import { Button } from '@shadcn-ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { CancelCircleIcon, SearchIcon } from '@hugeicons/core-free-icons';

type SearchFilterProps = {
	label: string;
	value?: string;
	onChange: (value?: string) => void;

	placeholder?: string;
	description?: string;
	error?: string;

	debounceMs?: number;
};

const SearchFilter = ({
	label,
	value,
	onChange,
	placeholder = 'Search…',
	description,
	error,
	debounceMs = 400,
}: SearchFilterProps) => {
	const [local, setLocal] = useState(value ?? '');

	useEffect(() => {
		setLocal(value ?? '');
	}, [value]);

	useEffect(() => {
		const handler = setTimeout(() => {
			const trimmed = local.trim();
			onChange(trimmed === '' ? undefined : trimmed);
		}, debounceMs);

		return () => clearTimeout(handler);
	}, [local, debounceMs, onChange]);

	return (
		<div className="space-y-1">
			<Label className="text-sm">{label}</Label>

			<div className="relative">
				<HugeiconsIcon
					icon={SearchIcon}
					className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
				/>

				<Input
					value={local}
					placeholder={placeholder}
					onChange={(e) => setLocal(e.target.value)}
					className="pl-9 pr-9"
				/>

				{local && (
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={() => setLocal('')}
						className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
					>
						<HugeiconsIcon
							icon={CancelCircleIcon}
							className="h-4 w-4"
						/>
					</Button>
				)}
			</div>

			{description && (
				<p className="text-xs text-muted-foreground">{description}</p>
			)}

			{error && <p className="text-xs text-destructive">{error}</p>}
		</div>
	);
};

export default SearchFilter;
