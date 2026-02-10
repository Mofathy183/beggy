import { Switch } from '@shadcn-ui/switch';
import { Label } from '@shadcn-ui/label';
import { Button } from '@shadcn-ui/button';
import { cn } from '@shadcn-lib';

type SwitchFilterProps = {
	label: string;
	value?: boolean;
	onChange: (value?: boolean) => void;

	trueLabel?: string;
	falseLabel?: string;

	description?: string;
	error?: string;
};

const SwitchFilter = ({
	label,
	value,
	onChange,
	trueLabel = 'Yes',
	falseLabel = 'No',
	description,
	error,
}: SwitchFilterProps) => {
	const isOn = value === true;
	const isExcluded = value === false;

	return (
		<div className="space-y-1">
			<div className="flex items-center justify-between">
				<Label className="text-sm">{label}</Label>

				<div className="flex items-center gap-2">
					<span className="text-xs text-muted-foreground">
						{isExcluded ? falseLabel : trueLabel}
					</span>

					<Switch
						checked={isOn}
						onCheckedChange={(checked) =>
							onChange(checked ? true : undefined)
						}
					/>
				</div>
			</div>

			{/* Exclude / Reset control */}
			{isOn && (
				<div className="flex gap-2 pt-1">
					<Button
						type="button"
						variant="outline"
						size="xs"
						onClick={() => onChange(false)}
						className={cn(
							isExcluded && 'border-primary text-primary'
						)}
					>
						Exclude ({falseLabel})
					</Button>

					<Button
						type="button"
						variant="ghost"
						size="xs"
						onClick={() => onChange(undefined)}
					>
						Clear
					</Button>
				</div>
			)}

			{description && (
				<p className="text-xs text-muted-foreground">{description}</p>
			)}

			{error && <p className="text-xs text-destructive">{error}</p>}
		</div>
	);
};

export default SwitchFilter;
