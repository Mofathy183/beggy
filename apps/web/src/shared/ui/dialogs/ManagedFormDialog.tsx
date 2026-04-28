'use client';

import { type ReactNode } from 'react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogClose,
} from '@shadcn-ui/dialog';
import { Button } from '@shadcn-ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon } from '@hugeicons/core-free-icons';
import { cn } from '@shadcn-lib';

// ─── Shared dialog styles ─────────────────────────────────────────────────────
//
// Exported so FormDialog and ManagedFormDialog apply identical
// Card neutralisation + scroll layout. Import in FormDialog and replace
// the inline class arrays with these constants to keep both in sync.

export const DIALOG_SIZE_CLASS = {
	sm: 'sm:max-w-lg',
	md: 'sm:max-w-xl',
	lg: 'sm:max-w-2xl',
} as const;

export const DIALOG_BASE_CLASS = [
	'w-full p-0 gap-0',
	// Card neutralisation
	'[&_[data-slot=card]]:border-0',
	'[&_[data-slot=card]]:shadow-none',
	'[&_[data-slot=card]]:bg-transparent',
	'[&_[data-slot=card]]:rounded-none',
	'[&_[data-slot=card]]:w-full',
] as const;

export const DIALOG_SCROLL_CLASS = [
	// Card fills dialog height as a flex column
	'[&_[data-slot=card]]:flex',
	'[&_[data-slot=card]]:flex-col',
	'[&_[data-slot=card]]:max-h-[90vh]',
	// CardHeader — frozen at top
	'[&_[data-slot=card-header]]:shrink-0',
	'[&_[data-slot=card-header]]:border-b',
	'[&_[data-slot=card-header]]:border-border',
	// CardContent — grows + scrolls
	'[&_[data-slot=card-content]]:flex-1',
	'[&_[data-slot=card-content]]:min-h-0',
	'[&_[data-slot=card-content]]:overflow-y-auto',
	'[&_[data-slot=card-content]]:overscroll-contain',
	// CardFooter — frozen at bottom
	'[&_[data-slot=card-footer]]:shrink-0',
	'[&_[data-slot=card-footer]]:border-t',
	'[&_[data-slot=card-footer]]:border-border',
] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

type ManagedFormDialogProps = {
	/**
	 * Controls whether the dialog is open.
	 * Drive this with a boolean state or a nullable item:
	 *
	 * @example — boolean
	 * open={editOpen}
	 *
	 * @example — nullable item (open when item exists)
	 * open={!!itemToEdit}
	 */
	open: boolean;

	/**
	 * Called when the dialog requests to close.
	 * Fires on: Escape key, backdrop click, or when the form calls onCancel.
	 *
	 * Use to set your open state back to false / null:
	 * onOpenChange={() => setEditOpen(false)}
	 * onOpenChange={() => setItemToEdit(null)}
	 */
	onOpenChange: (open: boolean) => void;

	/**
	 * Render prop — receives `onCancel` (closes the dialog) and returns your
	 * smart form container.
	 *
	 * Pass `onCancel` to the form's `onCancel` prop so the Cancel button
	 * inside the form closes the dialog. Pass it to `onSuccess` too if you
	 * want the dialog to close after a successful mutation.
	 *
	 * @example — UpdateItemForm (item from parent state)
	 * form={(onCancel) => (
	 *   <UpdateItemForm
	 *     item={item}
	 *     onCancel={onCancel}
	 *     onSuccess={() => { onCancel(); refetch(); }}
	 *   />
	 * )}
	 *
	 * @example — EditProfileForm
	 * form={(onCancel) => (
	 *   <EditProfileForm onCancel={onCancel} />
	 * )}
	 */
	form: (onCancel: () => void) => ReactNode;

	/**
	 * Accessible dialog title — required for screen readers.
	 * Rendered visually hidden (sr-only) so it doesn't duplicate
	 * the form's own CardTitle heading.
	 *
	 * @example 'Edit Passport'   (dynamic: `Edit ${item.name}`)
	 * @example 'Edit profile'
	 * @example 'Update role'
	 */
	title: string;

	description?: string;

	/**
	 * Max width of the dialog panel.
	 *
	 * - 'sm' → max-w-lg  (~512px)  UpdateItem, ChangeRole
	 * - 'md' → max-w-xl  (~576px)  EditProfile (avatar preview needs space)
	 * - 'lg' → max-w-2xl (~672px)  future wide forms
	 *
	 * @default 'sm'
	 */
	size?: keyof typeof DIALOG_SIZE_CLASS;

	/**
	 * Enable scroll on the CardContent zone.
	 *
	 * true  → CardContent scrolls. CardHeader + CardFooter stay frozen.
	 *         Use for forms with 3+ fields.
	 *
	 * false → No scroll. Dialog height matches content.
	 *         Use for single-field forms (ChangeRole).
	 *
	 * @default true
	 */
	scrollable?: boolean;

	className?: string;
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * ManagedFormDialog
 *
 * The update-flow counterpart to FormDialog.
 *
 * ── When to use which ─────────────────────────────────────────────────────────
 *
 * FormDialog            → create flows
 *   - Has a trigger button (DialogTrigger)
 *   - Owns its own open state internally
 *   - User clicks a button → dialog opens
 *   - Example: "Add item" button on ItemsPage
 *
 * ManagedFormDialog  → update / edit flows
 *   - No trigger button — opened by the parent
 *   - open + onOpenChange props control visibility
 *   - Parent opens it by setting state (boolean or nullable item)
 *   - Example: clicking "Edit" on an ItemCard → setItemToEdit(item)
 *   - Example: clicking "Edit" button on ItemDetailsPage → setEditOpen(true)
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
 * @example — ItemDetailsPage (boolean open state)
 * const [editOpen, setEditOpen] = useState(false);
 *
 * <Button onClick={() => setEditOpen(true)}>Edit</Button>
 *
 * <ManagedFormDialog
 *   open={editOpen}
 *   onOpenChange={(open) => setEditOpen(open)}
 *   title={`Edit ${item.name}`}
 *   form={(onCancel) => (
 *     <UpdateItemForm
 *       item={item}
 *       onCancel={onCancel}
 *       onSuccess={() => { onCancel(); refetch(); }}
 *     />
 *   )}
 * />
 *
 * @example — ItemsPage (nullable item drives open state)
 * const [itemToEdit, setItemToEdit] = useState<ItemDTO | null>(null);
 *
 * <ItemsGrid onEdit={(item) => setItemToEdit(item)} />
 *
 * <ManagedFormDialog
 *   open={!!itemToEdit}
 *   onOpenChange={(open) => { if (!open) setItemToEdit(null); }}
 *   title={itemToEdit ? `Edit ${itemToEdit.name}` : 'Edit item'}
 *   form={(onCancel) => itemToEdit && (
 *     <UpdateItemForm
 *       item={itemToEdit}
 *       onCancel={onCancel}
 *       onSuccess={() => { onCancel(); refetch(); }}
 *     />
 *   )}
 * />
 *
 * @example — EditProfile (wider dialog)
 * <ManagedFormDialog
 *   open={editOpen}
 *   onOpenChange={setEditOpen}
 *   title="Edit profile"
 *   size="md"
 *   form={(onCancel) => <EditProfileForm onCancel={onCancel} />}
 * />
 */
const ManagedFormDialog = ({
	open,
	onOpenChange,
	form,
	title,
	description,
	size = 'sm',
	scrollable = true,
	className,
}: ManagedFormDialogProps) => {
	const handleCancel = () => onOpenChange(false);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className={cn(
					...DIALOG_BASE_CLASS,
					DIALOG_SIZE_CLASS[size],
					'[&>button[data-slot=dialog-close]]:hidden',
					// ── Flex column so header + form fill dialog correctly ──
					'flex flex-col max-h-[90vh]',

					'[&>form]:flex',
					'[&>form]:flex-col',
					'[&>form]:flex-1',
					'[&>form]:min-h-0',

					// ── Suppress the Card's own chrome — dialog owns the shell ──
					'**:data-[slot=card-header]:hidden',
					'**:data-[slot=card]:border-0',
					'**:data-[slot=card]:shadow-none',
					'**:data-[slot=card]:bg-transparent',
					'**:data-[slot=card]:rounded-none',
					'**:data-[slot=card]:w-full',
					'**:data-[slot=card]:flex',
					'**:data-[slot=card]:flex-col',
					'**:data-[slot=card]:flex-1', // fill remaining space after DialogHeader
					'**:data-[slot=card]:min-h-0',
					// ── CardContent scrolls ──
					scrollable && '**:data-[slot=card-content]:flex-1',
					scrollable && '**:data-[slot=card-content]:min-h-0',
					scrollable && '**:data-[slot=card-content]:overflow-y-auto',
					scrollable &&
						'**:data-[slot=card-content]:overscroll-contain',
					// ── CardFooter frozen at bottom ──
					'**:data-[slot=card-footer]:shrink-0',
					'**:data-[slot=card-footer]:border-t',
					'**:data-[slot=card-footer]:border-border',
					className
				)}
			>
				{/* ── Visible header ─────────────────────────────────── */}
				<DialogHeader
					className={cn(
						'flex flex-row items-start justify-between gap-4',
						'border-b border-border',
						'px-6 py-4',
						'shrink-0',
						'text-start'
					)}
				>
					<div className="flex flex-col gap-0.5 min-w-0">
						<DialogTitle className="text-base font-semibold text-foreground leading-snug">
							{title}
						</DialogTitle>
						{description && (
							<DialogDescription className="text-sm text-muted-foreground">
								{description}
							</DialogDescription>
						)}
					</div>

					{/* Close button — in the header, not floating */}
					<DialogClose
						render={
							<Button
								type="button"
								variant="ghost"
								size="icon"
								data-testid="actions-trigger"
								className="shrink-0 h-8 w-8 text-muted-foreground hover:text-foreground"
								aria-label="Close"
							>
								<HugeiconsIcon
									icon={Cancel01Icon}
									className="h-4 w-4"
								/>
							</Button>
						}
					/>
				</DialogHeader>

				{/* ── Form content ─────────────────────────────────────── */}
				{form(handleCancel)}
			</DialogContent>
		</Dialog>
	);
};

export default ManagedFormDialog;
