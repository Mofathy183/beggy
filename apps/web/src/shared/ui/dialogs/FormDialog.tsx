'use client';

import { useState, type ReactElement, type ReactNode } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@shadcn-ui/dialog';
import { cn } from '@shadcn-lib';

import {
	DIALOG_SIZE_CLASS,
	DIALOG_BASE_CLASS,
	DIALOG_SCROLL_CLASS,
} from './ManagedFormDialog';

// ─── Types ────────────────────────────────────────────────────────────────────

type FormDialogProps = {
	/**
	 * The element that opens the dialog.
	 * Pass any <Button> or clickable element.
	 */
	trigger: ReactElement;

	/**
	 * Render prop — receives `onCancel` and returns your smart form container.
	 * Pass `onCancel` to the form's `onCancel` prop. The Cancel button inside
	 * the form UI calls it, which closes the dialog.
	 *
	 * Pass it to `onSuccess` too if you want the dialog to close after a
	 * successful mutation.
	 *
	 * @example
	 * form={(onCancel) => (
	 *   <CreateItemForm onCancel={onCancel} onSuccess={onCancel} />
	 * )}
	 *
	 * @example
	 * form={(onCancel) => <CreateUserForm onCancel={onCancel} />}
	 */
	form: (onCancel: () => void) => ReactNode;

	/**
	 * Max width of the dialog panel.
	 *
	 * - 'sm' → max-w-lg  (~512px)  CreateUser, ChangeRole
	 * - 'md' → max-w-xl  (~576px)  CreateItem, UpdateItem, EditProfile
	 * - 'lg' → max-w-2xl (~672px)  future wide forms
	 *
	 * @default 'sm'
	 */
	size?: keyof typeof DIALOG_SIZE_CLASS;

	/**
	 * Enable scroll on the CardContent zone.
	 *
	 * true  → CardContent scrolls. CardHeader and CardFooter stay frozen.
	 *         The title and Cancel/Submit buttons are always visible.
	 *         Use for forms with 3+ fields (CreateItem, CreateUser, EditProfile).
	 *
	 * false → No scroll. Dialog height matches form content.
	 *         Use for single-field forms (ChangeRole).
	 *
	 * @default true
	 */
	scrollable?: boolean;

	className?: string;
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * FormDialog
 *
 * Self-contained dialog wrapper for create flows.
 * Owns its own open state — opened by the user clicking the trigger button.
 *
 * For update / edit flows (opened programmatically by selecting an item),
 * use ControlledFormDialog instead.
 *
 * ── When to use which ─────────────────────────────────────────────────────────
 *
 * FormDialog            → create flows (has trigger button, self-contained)
 * ControlledFormDialog  → update/edit flows (open prop, no trigger)
 *
 * ── Layout (scrollable=true) ──────────────────────────────────────────────────
 *
 *  DialogContent  [max-h-90vh, overflow-hidden]
 *  └── Card       [flex-col, fills dialog — neutralised border/shadow/bg]
 *      ├── CardHeader   [shrink-0, border-b]   ← frozen
 *      ├── CardContent  [flex-1, overflow-y-auto] ← scrolls
 *      └── CardFooter   [shrink-0, border-t]   ← frozen
 *
 * ── Usage ─────────────────────────────────────────────────────────────────────
 *
 * @example — CreateItem
 * <FormDialog
 *   trigger={
 *     <Button>
 *       <HugeiconsIcon icon={Add01Icon} className="h-4 w-4" />
 *       Add item
 *     </Button>
 *   }
 *   form={(onCancel) => (
 *     <CreateItemForm onCancel={onCancel} onSuccess={onCancel} />
 *   )}
 * />
 *
 * @example — CreateUser
 * <FormDialog
 *   trigger={<Button>Create user</Button>}
 *   form={(onCancel) => <CreateUserForm onCancel={onCancel} />}
 * />
 *
 * @example — ChangeRole (no scroll — single field)
 * <FormDialog
 *   trigger={<Button variant="outline" size="sm">Change role</Button>}
 *   scrollable={false}
 *   form={(onCancel) => (
 *     <ChangeRoleForm onCancel={onCancel} userId={userId} />
 *   )}
 * />
 *
 * @example — EditProfile (wider panel)
 * <FormDialog
 *   trigger={<Button variant="outline">Edit profile</Button>}
 *   size="md"
 *   form={(onCancel) => <EditProfileForm onCancel={onCancel} />}
 * />
 */
const FormDialog = ({
	trigger,
	form,
	size = 'sm',
	scrollable = true,
	className,
}: FormDialogProps) => {
	const [open, setOpen] = useState(false);

	const handleCancel = () => setOpen(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{/* Trigger — asChild keeps the button's own styling intact */}
			<DialogTrigger render={trigger} />

			<DialogContent
				className={cn(
					...DIALOG_BASE_CLASS,
					DIALOG_SIZE_CLASS[size],
					scrollable && DIALOG_SCROLL_CLASS,
					className
				)}
			>
				{form(handleCancel)}
			</DialogContent>
		</Dialog>
	);
};

export default FormDialog;
