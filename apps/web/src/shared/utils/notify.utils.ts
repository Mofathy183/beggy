import { toast } from 'sonner';
import { createElement } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	CheckmarkCircle02Icon,
	AlertTriangle,
	AlertSquareIcon,
	InformationCircleIcon,
} from '@hugeicons/core-free-icons';

import type { HttpClientError } from '@shared/types';

// ─── Icon helpers ─────────────────────────────────────────────────────────────
//
// Sonner's `icon` option accepts a ReactNode.
// We use createElement (no JSX in a .ts file) to keep this file importable
// from both client and server contexts without a 'use client' directive.
//
// altColor={false} — disables HugeIcons' dual-tone fill mode so icons
// reliably inherit currentColor from the toast's className.

const SuccessIcon = () =>
	createElement(HugeiconsIcon, {
		icon: CheckmarkCircle02Icon,
		className: 'h-4 w-4 text-success shrink-0',
	});

const ErrorIcon = () =>
	createElement(HugeiconsIcon, {
		icon: AlertTriangle,
		className: 'h-4 w-4 text-destructive shrink-0',
	});

const WarningIcon = () =>
	createElement(HugeiconsIcon, {
		icon: AlertSquareIcon,
		className: 'h-4 w-4 text-warning-foreground',
	});

const InfoIcon = () =>
	createElement(HugeiconsIcon, {
		icon: InformationCircleIcon,
		className: 'h-4 w-4 text-primary shrink-0',
	});

// ─── Types ────────────────────────────────────────────────────────────────────

type NotifySuccessOptions = {
	/** The main message shown as the toast title. */
	message: string;
	/** Optional supporting text shown below the title. */
	description?: string;
	/** Duration in ms. @default 4000 */
	duration?: number;
};

type NotifyErrorOptions = {
	/** The main message shown as the toast title. */
	message: string;
	/**
	 * The actionable suggestion shown below the title.
	 * Maps directly to HttpClientError.body.suggestion.
	 * Falsy values (undefined, null, "") are intentionally suppressed —
	 * Sonner renders an empty description row if passed an empty string.
	 */
	suggestion?: string | null;
	/** Duration in ms. @default 6000 — errors stay longer so users can read the suggestion */
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
	/** Duration in ms. @default 6000 */
	duration?: number;
};

// ─── notify ───────────────────────────────────────────────────────────────────

/**
 * notify
 *
 * Typed wrapper around Sonner's `toast()` API.
 * The single import your components need for all notification types.
 *
 * ── Why not call toast() directly? ────────────────────────────────────────────
 *
 * 1. Type safety — each variant enforces the correct field names
 *    (message/suggestion for errors, message/description elsewhere).
 * 2. Consistency — icon, duration defaults, and field mapping are decided once here.
 * 3. HttpClientError integration — `notify.error.fromHttp()` unpacks the
 *    error shape from the API client in one place; components stay clean.
 * 4. Empty string safety — description/suggestion are suppressed when falsy,
 *    preventing Sonner from rendering a blank description row.
 *
 * ── Usage ─────────────────────────────────────────────────────────────────────
 *
 * @example — Success (after saving packing list)
 * notify.success({ message: 'Bag packed and ready to go! ✈️' });
 *
 * @example — Success with description
 * notify.success({
 *   message: 'Profile updated',
 *   description: 'Your travel details have been saved.',
 * });
 *
 * @example — Error from HttpClientError (most common in catch blocks)
 * catch (err) {
 *   if (isHttpClientError(err)) {
 *     notify.error.fromHttp(err);
 *   }
 * }
 *
 * @example — Error with manual fields
 * notify.error({
 *   message: "Couldn't save your bag.",
 *   suggestion: 'Check your connection and give it another go.',
 * });
 *
 * @example — Warning
 * notify.warning({
 *   message: 'Almost at the weight limit',
 *   description: 'You have about 200g left — pack the heavy stuff first.',
 * });
 *
 * @example — Info
 * notify.info({
 *   message: 'Pro tip: add items to your library first',
 *   description: 'Library items can be quickly dropped into any bag.',
 * });
 */
export const notify = {
	// ── Success ────────────────────────────────────────────────────────────────

	success: ({
		message,
		description,
		duration = 4000,
	}: NotifySuccessOptions) => {
		toast.success(message, {
			// Suppress empty strings — Sonner renders a blank row otherwise
			description: description || undefined,
			icon: createElement(SuccessIcon),
			duration,
		});
	},

	// ── Error ──────────────────────────────────────────────────────────────────

	error: Object.assign(
		({ message, suggestion, duration = 6000 }: NotifyErrorOptions) => {
			toast.error(message, {
				/*
				 * `suggestion` maps to Sonner's `description` slot.
				 * Shown below the title in a smaller, muted style.
				 * Suppressed when falsy — prevents blank description rows.
				 * ErrorCode is intentionally omitted — machine-readable codes
				 * belong in logs, not in user-facing notifications.
				 */
				description: suggestion || undefined,
				icon: createElement(ErrorIcon),
				duration,
			});
		},
		{
			/**
			 * fromHttp — unpacks an HttpClientError directly.
			 *
			 * Uses named options object for consistency with the rest of the notify API.
			 *
			 * Maps:
			 * - err.body.message    → toast title
			 * - err.body.suggestion → toast description (suppressed if falsy)
			 * - err.body.code       → intentionally ignored in UI
			 * - err.statusCode      → intentionally ignored in UI
			 *
			 * @example
			 * catch (err) {
			 *   if (isHttpClientError(err)) notify.error.fromHttp(err);
			 * }
			 *
			 * @example — with custom duration
			 * notify.error.fromHttp(err, { duration: 8000 });
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

	// ── Warning ────────────────────────────────────────────────────────────────

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

	// ── Info ───────────────────────────────────────────────────────────────────

	info: ({ message, description, duration = 4000 }: NotifyInfoOptions) => {
		toast.info(message, {
			description: description || undefined,
			icon: createElement(InfoIcon),
			duration,
		});
	},
};
