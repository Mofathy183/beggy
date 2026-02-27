'use client';
import { ReactNode } from 'react';
import { PublicOnlyRoute } from '@shared/guards';

export default function PublicLayout({ children }: { children: ReactNode }) {
	return <PublicOnlyRoute children={children} />;
}
