'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

/**
 * ThemeProvider
 *
 * A thin wrapper around `next-themes` ThemeProvider.
 *
 * This component enables class-based theme switching (`light`, `dark`, `system`)
 * across the entire application. It should be mounted once at the root layout level.
 *
 * Why this wrapper exists:
 * - Keeps `next-themes` isolated from the rest of the app
 * - Allows future customization (default props, forced theme, etc.)
 * - Maintains a clean shared UI boundary
 *
 * @param children - React nodes rendered inside the provider
 * @param props - All props supported by `NextThemesProvider`
 *
 * @example
 * <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
 *   <App />
 * </ThemeProvider>
 */
const ThemeProvider = ({
	children,
	...props
}: React.ComponentProps<typeof NextThemesProvider>) => {
	return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
};

export default ThemeProvider;
