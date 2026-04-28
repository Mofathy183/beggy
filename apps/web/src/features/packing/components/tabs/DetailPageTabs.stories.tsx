import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import DetailPageTabs, { type DetailPageTab } from './DetailPageTabs';
import { ContainerType } from '@beggy/shared/constants';

// ─────────────────────────────────────────────────────────────────────────────
// Mock navigation handler (Storybook-safe)
// ─────────────────────────────────────────────────────────────────────────────
const navigateMock = () => {};

// ───────────────────────────────────────────────────────────────────────────────
// Mock stable data (Chromatic-safe)
// ───────────────────────────────────────────────────────────────────────────────

const baseProps = {
	containerId: 'container-123',
	containerName: 'Summer Trip Bag',
	containerType: ContainerType.BAG,
	sourceId: 'source-123',
	maxWeight: 20,
	maxCapacity: 30,
	weightUnit: 'kg',
	capacityUnit: 'L',
};

// ───────────────────────────────────────────────────────────────────────────────
// Controlled wrapper (CRITICAL)
// ───────────────────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TabsWrapper(args: any) {
	const [activeTab, setActiveTab] = useState<DetailPageTab>(args.activeTab);

	return (
		<div className="w-full max-w-md">
			<DetailPageTabs
				{...args}
				activeTab={activeTab}
				onNavigateToPacking={navigateMock}
				onTabChange={setActiveTab}
			/>
		</div>
	);
}

// ───────────────────────────────────────────────────────────────────────────────
// Meta
// ───────────────────────────────────────────────────────────────────────────────

const meta: Meta<typeof DetailPageTabs> = {
	title: 'Features/Packing/Tabs/DetailPageTabs',
	component: DetailPageTabs,
	tags: ['autodocs'],

	parameters: {
		docs: {
			description: {
				component: `
DetailPageTabs is a navigation component used on container detail pages (bags and suitcases).

It allows users to switch between viewing container information and entering the packing workspace.

---

**When to use**

- On BagDetailsPage and SuitcaseDetailsPage
- When users need a clear separation between viewing details and performing packing actions

---

**When NOT to use**

- As a generic tab system for arbitrary content
- Outside of container-related detail pages

---

**Interaction model**

- "Info" tab updates local UI state and remains on the page
- "Pack" tab triggers navigation to the packing workspace
- "Pack" does not become active because the user leaves the page

---

**Constraints**

- Only two tabs are supported: Info and Pack
- Pack tab must always navigate away
- Active state applies only to the Info tab

---

**Accessibility guarantees**

- Uses role="tablist" and role="tab"
- aria-selected reflects active state
- Fully keyboard accessible (Tab + Enter)
- Icons are decorative (aria-hidden)

---

**Design-system notes**

- Built using token-driven Tailwind styling
- Uses muted background and pill-style active state
- Must remain visually consistent with PackingTabButton variant="tab"
        `,
			},
		},
	},

	argTypes: {
		activeTab: {
			table: { disable: true },
		},
		onTabChange: {
			table: { disable: true },
		},
		onNavigateToPacking: {
			description: 'Triggered when navigation to packing occurs.',
			table: {
				type: { summary: '() => void' },
			},
			action: 'navigate',
		},
		containerId: {
			control: 'text',
			description: 'Unique container identifier used for navigation.',
			table: { type: { summary: 'string' } },
		},
		containerName: {
			control: 'text',
			description: 'Display name shown in the packing page.',
			table: { type: { summary: 'string' } },
		},
		containerType: {
			control: 'radio',
			options: [ContainerType.BAG, ContainerType.SUITCASE],
			description: 'Defines icon and behavior for packing context.',
			table: { type: { summary: 'ContainerType' } },
		},
		sourceId: {
			control: 'text',
			description: 'Source entity ID for navigation back-link.',
			table: { type: { summary: 'string' } },
		},
		maxWeight: {
			control: 'number',
			description: 'Maximum allowed weight for the container.',
			table: { type: { summary: 'number' } },
		},
		maxCapacity: {
			control: 'number',
			description: 'Maximum capacity of the container.',
			table: { type: { summary: 'number' } },
		},
		weightUnit: {
			control: 'text',
			description: 'Weight measurement unit.',
			table: {
				type: { summary: 'string' },
				defaultValue: { summary: 'kg' },
			},
		},
		capacityUnit: {
			control: 'text',
			description: 'Capacity measurement unit.',
			table: {
				type: { summary: 'string' },
				defaultValue: { summary: 'L' },
			},
		},
		className: {
			table: { disable: true },
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

// ───────────────────────────────────────────────────────────────────────────────
// Stories
// ───────────────────────────────────────────────────────────────────────────────

/**
 * Default state.
 *
 * The Info tab is active by default.
 * Users can switch tabs or navigate to packing.
 */
export const Default: Story = {
	args: {
		...baseProps,
		activeTab: 'info',
	},
	render: (args) => <TabsWrapper {...args} />,
	parameters: {
		docs: {
			description: {
				story: 'Default state where the Info tab is active and the user is viewing container details.',
			},
		},
	},
};

/**
 * User switches tabs.
 *
 * Demonstrates interactive behavior of the Info tab.
 */
export const WithInteraction: Story = {
	args: {
		...baseProps,
		activeTab: 'info',
	},
	render: (args) => <TabsWrapper {...args} />,
	parameters: {
		docs: {
			description: {
				story: 'Users can switch the active tab using mouse or keyboard. The Info tab updates state locally.',
			},
		},
	},
};

/**
 * Suitcase variant.
 *
 * Shows different icon and context behavior.
 */
export const Suitcase: Story = {
	args: {
		...baseProps,
		containerType: ContainerType.SUITCASE,
		containerName: 'Checked Luggage',
	},
	render: (args) => <TabsWrapper {...args} />,
	parameters: {
		docs: {
			description: {
				story: 'Displays suitcase-specific context including icon differences in the Pack tab.',
			},
		},
	},
};

/**
 * Narrow container.
 *
 * Tests layout behavior under constrained width.
 */
export const NarrowContainer: Story = {
	args: {
		...baseProps,
	},
	render: (args) => (
		<div className="w-[220px]">
			<TabsWrapper {...args} />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Validates that tabs remain usable and readable in constrained layouts.',
			},
		},
	},
};

/**
 * Dark mode validation.
 *
 * Ensures contrast, focus, and visibility.
 */
export const DarkMode: Story = {
	args: {
		...baseProps,
	},
	render: (args) => <TabsWrapper {...args} />,
	globals: {
		theme: 'dark',
	},
	parameters: {
		docs: {
			description: {
				story: 'Ensures proper contrast, focus visibility, and readability in dark mode.',
			},
		},
	},
};
