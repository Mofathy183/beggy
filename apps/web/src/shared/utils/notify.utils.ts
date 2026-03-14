import { toast } from 'sonner';
import { createElement } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
	CheckmarkCircle02Icon,
	AlertCircleIcon,
	Alert02Icon,
	InformationCircleIcon,
} from '@hugeicons/core-free-icons';

import type { HttpClientError } from '@shared/types';

// ─── Icon helpers ─────────────────────────────────────────────────────────────
//
// Sonner's `icon` option accepts a ReactNode.
// We use createElement (no JSX in a .ts file) to keep this file importable
// from both client and server contexts without a 'use client' directive.
// The icon color is handled by the toast's className — icons inherit currentColor.

const SuccessIcon = () =>
	createElement(HugeiconsIcon, {
		icon: CheckmarkCircle02Icon,
		className: 'h-4 w-4 text-success shrink-0',
	});

const ErrorIcon = () =>
	createElement(HugeiconsIcon, {
		icon: AlertCircleIcon,
		className: 'h-4 w-4 text-destructive shrink-0',
	});

const WarningIcon = () =>
	createElement(HugeiconsIcon, {
		icon: Alert02Icon,
		className: 'h-4 w-4 text-warning-foreground shrink-0',
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
	 * The suggestion shown below the title.
	 * Maps directly to ErrorResponse.suggestion.
	 */
	suggestion?: string;
	/** Duration in ms. @default 6000 — errors stay longer */
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
 * 2. Consistency — icon, duration, and field mapping are decided once here.
 * 3. HttpClientError integration — `notify.error.fromHttp()` unpacks the
 *    error shape from the API client in one place; components stay clean.
 *
 * ── Usage ─────────────────────────────────────────────────────────────────────
 *
 * @example — Success (after mutation)
 * notify.success({ message: 'Item added to your bag!' });
 *
 * @example — Success with description
 * notify.success({
 *   message: 'Profile updated',
 *   description: 'Your changes have been saved.',
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
 *   message: 'Could not delete item.',
 *   suggestion: 'The item may already be removed. Try refreshing.',
 * });
 *
 * @example — Warning
 * notify.warning({
 *   message: 'Bag is almost full',
 *   description: 'You have 200g left before reaching the weight limit.',
 * });
 *
 * @example — Info
 * notify.info({
 *   message: 'Tip: add items to your library first',
 *   description: 'Items in your library can be packed into any bag.',
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
			description,
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
				 * It's shown below the title in a smaller, muted style.
				 * ErrorCode is intentionally omitted — machine-readable codes
				 * belong in logs, not in user-facing notifications.
				 */
				description: suggestion,
				icon: createElement(ErrorIcon),
				duration,
			});
		},
		{
			/**
			 * fromHttp — unpacks an HttpClientError directly.
			 *
			 * Maps:
			 * - err.body.message    → toast title
			 * - err.body.suggestion → toast description (below title)
			 * - err.body.code       → intentionally ignored in UI
			 * - err.statusCode      → intentionally ignored in UI
			 *
			 * @example
			 * catch (err) {
			 *   if (isHttpClientError(err)) notify.error.fromHttp(err);
			 * }
			 */
			fromHttp: (err: HttpClientError, duration = 6000) => {
				toast.error(err.body.message, {
					description: err.body.suggestion,
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
			description,
			icon: createElement(WarningIcon),
			duration,
		});
	},

	// ── Info ───────────────────────────────────────────────────────────────────

	info: ({ message, description, duration = 4000 }: NotifyInfoOptions) => {
		toast.info(message, {
			description,
			icon: createElement(InfoIcon),
			duration,
		});
	},
};
