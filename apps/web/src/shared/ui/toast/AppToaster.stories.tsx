import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import AppToaster from './AppToaster';
import { notify } from '@shared/utils';

const meta: Meta = {
	title: 'UI/Toast/AppToaster',
	tags: ['autodocs'],
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component: `
Toast notifications used across Beggy.

This story demonstrates the **notify() API** and the **AppToaster container**.

---

### Architecture

**AppToaster**

Provides the toast container using Sonner.

**notify**

Typed wrapper around Sonner's toast API.

---

### Notification Types

• success — completed actions  
• error — API failures  
• warning — user caution  
• info — helpful hints  

---

### Design System

Toasts follow the **soft semantic tint pattern**:

- tinted background
- semantic border
- colored title
- muted description
`,
			},
		},
	},
};

export default meta;

type Story = StoryObj;

export const ToastExamples: Story = {
	render: () => (
		<div className="flex flex-col gap-3">
			<AppToaster />

			<button
				className="px-4 py-2 rounded bg-green-600 text-white"
				onClick={() =>
					notify.success({
						message: 'Item added to your bag!',
						description:
							'You can review it anytime in your packing list.',
					})
				}
			>
				Show Success
			</button>

			<button
				className="px-4 py-2 rounded bg-red-600 text-white"
				onClick={() =>
					notify.error({
						message: 'Could not save item.',
						suggestion:
							'Check your internet connection and try again.',
					})
				}
			>
				Show Error
			</button>

			<button
				className="px-4 py-2 rounded bg-yellow-600 text-white"
				onClick={() =>
					notify.warning({
						message: 'Bag almost full',
						description: 'You have 200g remaining.',
					})
				}
			>
				Show Warning
			</button>

			<button
				className="px-4 py-2 rounded bg-blue-600 text-white"
				onClick={() =>
					notify.info({
						message: 'Tip',
						description: 'Add items to your library first.',
					})
				}
			>
				Show Info
			</button>
		</div>
	),
};

/**
 * Dark mode verification.
 *
 * Ensures icon contrast and focus visibility remain accessible.
 */
export const DarkMode: Story = {
	render: ToastExamples.render,
	parameters: {
		themes: { default: 'dark' },
		docs: {
			description: {
				story: 'Dark theme validation ensuring icons, focus rings, and text remain readable.',
			},
		},
	},
};
