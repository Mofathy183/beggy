import React from 'react';
import { AppProvider } from '../src/shared/store';
import { ThemeProvider } from '../src/shared/ui/theme';
import { TooltipProvider } from '../src/shared/components/ui/tooltip';
import { AppToaster } from '../src/shared/ui/toast';
import { definePreview } from '@storybook/nextjs-vite';
import '../src/app/globals.css';

const preview = definePreview({
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},

		a11y: {
			// 'todo' - show a11y violations in the test UI only
			// 'error' - fail CI on a11y violations
			// 'off' - skip a11y checks entirely
			test: 'todo',
		},
	},

	globalTypes: {
		theme: {
			name: 'Theme',
			description: 'App theme',
			defaultValue: 'light',
			toolbar: {
				icon: 'circlehollow',
				items: [
					{ value: 'light', title: 'Light' },
					{ value: 'dark', title: 'Dark' },
				],
				dynamicTitle: true,
			},
		},
	},

	decorators: [
		(Story, context) => {
			const theme = context.globals.theme;

			return (
				<ThemeProvider
					forcedTheme={theme}
					attribute="class"
					defaultTheme="light"
					enableSystem={false}
				>
					<AppProvider>
						<TooltipProvider delay={400}>
							<Story />
						</TooltipProvider>
						<AppToaster />
					</AppProvider>
				</ThemeProvider>
			);
		},
	],
});

export default preview;
