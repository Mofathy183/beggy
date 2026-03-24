'use client';
import { ReactNode } from 'react';
import { PublicOnlyRoute } from '@shared/guards';

/**
 * (public) layout — wraps /login and /signup ONLY.
 *
 * This group is for auth pages where authenticated users
 * should be redirected away (to /dashboard).
 * PublicOnlyRoute handles that redirect.
 *
 * Does NOT wrap the homepage (/) — that lives outside this group.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
	return <PublicOnlyRoute>{children}</PublicOnlyRoute>;
}
