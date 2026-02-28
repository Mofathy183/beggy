'use client';

import { useMeQuery } from '@features/auth/api';

/**
 * Auth bootstrap boundary.
 *
 * @description
 * Client-only component responsible for triggering the
 * current-session hydration request on application mount.
 *
 * @remarks
 * - Does not render UI.
 * - Side-effects are handled inside the RTK Query lifecycle
 *   (e.g. `onQueryStarted`) within the auth API slice.
 * - Should be mounted once at the application root.
 */
const AuthBootstrap = (): null => {
	useMeQuery();
	return null;
};

export default AuthBootstrap;
