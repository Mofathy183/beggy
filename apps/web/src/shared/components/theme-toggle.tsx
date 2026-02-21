'use client';

import { Moon, Sun } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useTheme } from 'next-themes';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@shadcn-ui/dropdown-menu';

/**
 * ThemeToggle
 *
 * A dropdown-based theme switcher that allows users to switch between:
 * - Light mode
 * - Dark mode
 * - System preference
 *
 * Uses `next-themes` to update the `class` attribute on the root element.
 *
 * Design Notes:
 * - Uses animated icon transition between Sun and Moon.
 * - Accessible via `sr-only` label.
 * - Built using shadcn UI primitives for consistency.
 *
 * This component should typically be placed in:
 * - App header
 * - Navigation bar
 * - Settings menu
 *
 * @example
 * <ThemeToggle />
 */
const ThemeToggle = () => {
	// Access theme setter from next-themes context
	const { setTheme } = useTheme();

	return (
		<DropdownMenu>
			{/* The trigger button that opens the dropdown */}
			<DropdownMenuTrigger
				type="button"
				className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border bg-background hover:bg-accent transition-colors"
			>
				{/* Light icon (visible in light mode) */}
				<HugeiconsIcon
					icon={Sun}
					className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
				/>

				{/* Dark icon (visible in dark mode) */}
				<HugeiconsIcon
					icon={Moon}
					className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
				/>

				{/* Accessibility label */}
				<span className="sr-only">Toggle theme</span>
			</DropdownMenuTrigger>

			{/* Dropdown options */}
			<DropdownMenuContent align="end">
				<DropdownMenuItem onClick={() => setTheme('light')}>
					Light
				</DropdownMenuItem>

				<DropdownMenuItem onClick={() => setTheme('dark')}>
					Dark
				</DropdownMenuItem>

				<DropdownMenuItem onClick={() => setTheme('system')}>
					System
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default ThemeToggle;
