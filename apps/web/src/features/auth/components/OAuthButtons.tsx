'use client';

import { GoogleIcon, Facebook01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@shadcn-ui/button';
import { env } from '@/env';

// ─── Props ────────────────────────────────────────────────────────────────────

type OAuthButtonsProps = {
	/**
	 * Determines button copy to align with page intent.
	 * - `login`  → "Continue with ..."
	 * - `signup` → "Sign up with ..."
	 */
	mode?: 'login' | 'signup';
};

const OAUTH_ROUTES = {
	google: `${env.API_URL}/auth/google`,
	facebook: `${env.API_URL}/auth/facebook`,
} as const;

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * OAuth entry buttons.
 *
 * @description
 * Initiates server-controlled OAuth flows via full-page redirects.
 *
 * @remarks
 * - Uses anchor navigation (not client mutations).
 * - Backend owns OAuth handshake and session cookie issuance.
 * - After redirect, session hydration is handled by `AuthBootstrap`.
 * - Requires `env.API_URL` to be correctly configured per environment.
 */
const OAuthButtons = ({ mode = 'login' }: OAuthButtonsProps) => {
	const verb = mode === 'signup' ? 'Sign up with' : 'Continue with';

	return (
		<div className="flex flex-col gap-3">
			{/* ── Google ──────────────────────────────────────────────── */}
			<a
				href={OAUTH_ROUTES.google}
				className="w-full"
				aria-label={`${verb} Google`}
			>
				<Button
					type="button"
					variant="outline"
					className="w-full gap-3 transition-colors hover:bg-accent hover:text-accent-foreground"
				>
					<HugeiconsIcon
						icon={GoogleIcon}
						size={17}
						strokeWidth={1.8}
						aria-hidden="true"
					/>
					<span>{verb} Google</span>
				</Button>
			</a>

			{/* ── Facebook ────────────────────────────────────────────── */}
			<a
				href={OAUTH_ROUTES.facebook}
				className="w-full"
				aria-label={`${verb} Facebook`}
			>
				<Button
					type="button"
					variant="outline"
					className="w-full gap-3 transition-colors hover:bg-accent hover:text-accent-foreground"
				>
					<HugeiconsIcon
						icon={Facebook01Icon}
						size={17}
						strokeWidth={1.8}
						aria-hidden="true"
					/>
					<span>{verb} Facebook</span>
				</Button>
			</a>
		</div>
	);
};

export default OAuthButtons;
