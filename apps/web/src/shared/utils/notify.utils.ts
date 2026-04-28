import { toast } from 'sonner';
import { createElement } from 'react';
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import {
	CheckmarkCircle02Icon,
	AlertTriangle,
	AlertSquareIcon,
	InformationCircleIcon,
} from '@hugeicons/core-free-icons';

import type { HttpClientError } from '@shared/types';

// ─── Icon helpers ─────────────────────────────────────────────────────────────

/**
 * Default icon size aligned with Sonner's visual scale.
 */
const ICON_SIZE = 20;

/**
 * Creates a single-color icon that inherits color from Tailwind utilities.
 *
 * @remarks
 * `HugeiconsIcon` ignores width/height classes — size must be passed explicitly.
 * Dual-tone mode is disabled to ensure predictable theming via `currentColor`.
 */
const createIcon = (icon: IconSvgElement, className: string) =>
	createElement(HugeiconsIcon, {
		icon,
		size: ICON_SIZE,
		className,
	});

const SuccessIcon = () =>
	createIcon(CheckmarkCircle02Icon, 'text-success shrink-0');
const ErrorIcon = () => createIcon(AlertTriangle, 'text-destructive shrink-0');
const WarningIcon = () => createIcon(AlertSquareIcon, 'text-warning shrink-0');
const InfoIcon = () => createIcon(InformationCircleIcon, 'text-info shrink-0');

// ─── Types ────────────────────────────────────────────────────────────────────

type NotifySuccessOptions = {
	message: string;
	description?: string;
	/** @default 4000 */
	duration?: number;
};

type NotifyErrorOptions = {
	message: string;
	/**
	 * User-facing recovery hint.
	 *
	 * @remarks
	 * Mapped to Sonner's `description`. Falsy values are suppressed to avoid
	 * rendering an empty description row.
	 */
	suggestion?: string | null;
	/** @default 6000 */
	duration?: number;
};

type NotifyWarningOptions = {
	message: string;
	description?: string;
	duration?: number;
};

type NotifyInfoOptions = {
	message: string;
	description?: string;
	duration?: number;
};

type FromHttpOptions = {
	/** @default 6000 */
	duration?: number;
};

// ─── notify ───────────────────────────────────────────────────────────────────

/**
 * Centralized notification API for the application.
 *
 * @description
 * Provides a typed, design-system-aligned wrapper around Sonner's `toast`.
 * This is the only entry point for triggering user-facing notifications.
 *
 * @remarks
 * - Normalizes message structure across variants.
 * - Prevents UI inconsistencies (icons, durations, layout).
 * - Decouples components from backend error shape via `error.fromHttp`.
 * - Suppresses empty descriptions to avoid visual artifacts.
 */
export const notify = {
	success: ({
		message,
		description,
		duration = 4000,
	}: NotifySuccessOptions) => {
		toast.success(message, {
			description: description || undefined,
			icon: createElement(SuccessIcon),
			duration,
		});
	},

	error: Object.assign(
		({ message, suggestion, duration = 6000 }: NotifyErrorOptions) => {
			toast.error(message, {
				/**
				 * Suggestion is rendered as secondary text.
				 * Suppressed when falsy to avoid empty layout rows.
				 */
				description: suggestion || undefined,
				icon: createElement(ErrorIcon),
				duration,
			});
		},
		{
			/**
			 * Maps an `HttpClientError` into a user-facing toast.
			 *
			 * @param err - Error returned from the HTTP client layer.
			 * @param options - Optional overrides (e.g., duration).
			 *
			 * @remarks
			 * - `message` → primary toast content
			 * - `suggestion` → secondary hint (optional)
			 * - Machine-readable fields (code, status) are intentionally excluded.
			 */
			fromHttp: (
				err: HttpClientError,
				{ duration = 6000 }: FromHttpOptions = {}
			) => {
				toast.error(err.body.message, {
					description: err.body.suggestion || undefined,
					icon: createElement(ErrorIcon),
					duration,
				});
			},
		}
	),

	warning: ({
		message,
		description,
		duration = 5000,
	}: NotifyWarningOptions) => {
		toast.warning(message, {
			description: description || undefined,
			icon: createElement(WarningIcon),
			duration,
		});
	},

	info: ({ message, description, duration = 4000 }: NotifyInfoOptions) => {
		toast.info(message, {
			description: description || undefined,
			icon: createElement(InfoIcon),
			duration,
		});
	},
};
