import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	CheckmarkCircle02Icon,
	AlertCircleIcon,
	Alert02Icon,
	InformationCircleIcon,
} from '@hugeicons/core-free-icons';

import AppToaster from './AppToaster';
import { notify } from '@shared/utils';

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta = {
	title: 'UI/Toast/AppToaster',
	tags: ['autodocs'],
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component: `
### AppToaster

The global toast container for Beggy. Drop it once in \`app/layout.tsx\`.

Powered by [Sonner](https://sonner.emilkowal.ski/) + the **\`notify\`** utility — the only import components need for all notification types.

---

### Architecture

| Layer | Responsibility |
|---|---|
| \`AppToaster\` | Sonner container — visual shell, theming, positioning |
| \`notify\` | Typed API wrapper — icon, duration defaults, HttpClientError unpacking |
| \`globals.css\` | Semantic title colors via \`[data-sonner-toast]\` selectors |

---

### Notification types

| Type | Use for | Duration |
|---|---|---|
| \`notify.success()\` | Completed actions | 4s |
| \`notify.error()\` | API failures, saves that didn't work | 6s |
| \`notify.warning()\` | Weight limits, near-capacity alerts | 5s |
| \`notify.info()\` | Tips, hints, onboarding nudges | 4s |

---

### Design pattern

Toasts follow the **soft semantic tint** from §12.7:
- Tinted \`bg-{token}/10\` surface — calm, not alarming
- \`border-{token}/25\` — visible but gentle
- Semantic title color via \`globals.css\`
- Muted description — supporting context only

---

### Travel buddy tone

Messages should feel like advice from a well-travelled friend:

\`\`\`ts
// ✅ Good — warm, actionable
notify.error({
  message: "Couldn't save your bag right now.",
  suggestion: 'Check your connection and give it another go.',
});

// ✅ Good — encouraging, specific
notify.warning({
  message: 'Almost at the weight limit',
  description: 'You have about 200g left — pack the lighter stuff last.',
});

// ❌ Avoid — robotic, cold
notify.error({ message: 'Error: SAVE_FAILED' });
\`\`\`
				`,
			},
		},
	},
};

export default meta;
type Story = StoryObj;

// ─── Trigger button ───────────────────────────────────────────────────────────
//
// Named functions (not anonymous arrows) — required for Storybook-Vite to
// correctly identify and render components without HMR issues.
// Uses semantic tokens only — no raw palette colors per §12.2.

type TriggerVariant = 'success' | 'error' | 'warning' | 'info';

const variantStyles: Record<TriggerVariant, string> = {
	success: ['bg-success/10 text-success'].join(' '),
	error: ['bg-destructive/10 text-destructive'].join(' '),
	warning: ['bg-warning/10 text-warning'].join(' '),
	info: ['bg-info/10 text-info'].join(' '),
};

// Named icon components — anonymous arrows break Storybook-Vite HMR
function SuccessTriggerIcon() {
	return (
		<HugeiconsIcon
			icon={CheckmarkCircle02Icon}
			className="h-4 w-4 shrink-0"
		/>
	);
}
function ErrorTriggerIcon() {
	return (
		<HugeiconsIcon icon={AlertCircleIcon} className="h-4 w-4 shrink-0" />
	);
}
function WarningTriggerIcon() {
	return <HugeiconsIcon icon={Alert02Icon} className="h-4 w-4 shrink-0" />;
}
function InfoTriggerIcon() {
	return (
		<HugeiconsIcon
			icon={InformationCircleIcon}
			className="h-4 w-4 shrink-0"
		/>
	);
}

const variantIcons: Record<TriggerVariant, () => React.JSX.Element> = {
	success: SuccessTriggerIcon,
	error: ErrorTriggerIcon,
	warning: WarningTriggerIcon,
	info: InfoTriggerIcon,
};

type TriggerButtonProps = {
	label: string;
	variant: TriggerVariant;
	onClick: () => void;
};

function TriggerButton({ label, variant, onClick }: TriggerButtonProps) {
	const Icon = variantIcons[variant];
	return (
		<button
			type="button"
			onClick={onClick}
			className={[
				'inline-flex items-center gap-2',
				'px-4 py-2 rounded-lg',
				'text-sm font-medium font-serif',
				'transition-colors cursor-pointer',
				variantStyles[variant],
			].join(' ')}
		>
			<Icon />
			{label}
		</button>
	);
}
// ─── Stories ──────────────────────────────────────────────────────────────────

/**
 * All four notification types together.
 * Click each button to fire the corresponding toast.
 */
export const AllTypes: Story = {
	name: 'All types',
	render: () => (
		<div className="flex flex-col gap-3 w-64">
			<AppToaster />

			<TriggerButton
				variant="success"
				label="Item added to bag"
				onClick={() =>
					notify.success({
						message: 'Added to your bag!',
						description:
							'You can review it anytime in your packing list.',
					})
				}
			/>

			<TriggerButton
				variant="error"
				label="Save failed"
				onClick={() =>
					notify.error({
						message: "Couldn't save your bag right now.",
						suggestion:
							'Check your connection and give it another go.',
					})
				}
			/>

			<TriggerButton
				variant="warning"
				label="Near weight limit"
				onClick={() =>
					notify.warning({
						message: 'Almost at the weight limit',
						description:
							'You have about 200g left — pack the lighter stuff last.',
					})
				}
			/>

			<TriggerButton
				variant="info"
				label="Packing tip"
				onClick={() =>
					notify.info({
						message: 'Pro tip: add items to your library first',
						description:
							'Library items can be quickly dropped into any bag.',
					})
				}
			/>
		</div>
	),
};

/**
 * Success — fires after a bag item is saved.
 * With and without a description.
 */
export const Success: Story = {
	render: () => (
		<div className="flex flex-col gap-3 w-64">
			<AppToaster />
			<TriggerButton
				variant="success"
				label="With description"
				onClick={() =>
					notify.success({
						message: 'Added to your bag!',
						description:
							'You can review it anytime in your packing list.',
					})
				}
			/>
			<TriggerButton
				variant="success"
				label="Title only"
				onClick={() =>
					notify.success({
						message: 'Bag packed and ready to go!',
					})
				}
			/>
		</div>
	),
};

/**
 * Error — shows both the manual API and the HttpClientError shortcut.
 * Errors stay visible for 6 seconds so users have time to read the suggestion.
 */
export const Error: Story = {
	render: () => (
		<div className="flex flex-col gap-3 w-64">
			<AppToaster />
			<TriggerButton
				variant="error"
				label="With suggestion"
				onClick={() =>
					notify.error({
						message: "Couldn't save your bag right now.",
						suggestion:
							'Check your connection and give it another go.',
					})
				}
			/>
			<TriggerButton
				variant="error"
				label="No suggestion"
				onClick={() =>
					notify.error({
						message: 'Something went sideways — give it a moment.',
					})
				}
			/>
		</div>
	),
};

/**
 * Warning — near weight limit, near bag capacity.
 */
export const Warning: Story = {
	render: () => (
		<div className="flex flex-col gap-3 w-64">
			<AppToaster />
			<TriggerButton
				variant="warning"
				label="Near weight limit"
				onClick={() =>
					notify.warning({
						message: 'Almost at the weight limit',
						description:
							'You have about 200g left — pack the lighter stuff last.',
					})
				}
			/>
			<TriggerButton
				variant="warning"
				label="Near item limit"
				onClick={() =>
					notify.warning({
						message: 'Bag is getting full',
						description:
							'A few more items and you will hit the limit.',
					})
				}
			/>
		</div>
	),
};

/**
 * Info — packing tips and onboarding hints.
 */
export const Info: Story = {
	render: () => (
		<div className="flex flex-col gap-3 w-64">
			<AppToaster />
			<TriggerButton
				variant="info"
				label="Library tip"
				onClick={() =>
					notify.info({
						message: 'Pro tip: add items to your library first',
						description:
							'Library items can be quickly dropped into any bag.',
					})
				}
			/>
			<TriggerButton
				variant="info"
				label="Rolling clothes"
				onClick={() =>
					notify.info({
						message: 'Want to save some space?',
						description:
							'Rolling clothes instead of folding can free up around 20% more room.',
					})
				}
			/>
		</div>
	),
};

/**
 * Dark mode — same stories, dark canvas.
 * Verifies icon contrast, focus rings, and tinted surfaces all hold up.
 */
export const DarkMode: Story = {
	name: 'Dark mode',
	render: AllTypes.render,
	globals: {
		theme: 'dark',
	},
};
