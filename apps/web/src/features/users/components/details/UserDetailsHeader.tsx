import { Button } from '@shadcn-ui/button';
import { ArrowLeft } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import type { AdminUserDTO } from '@beggy/shared/types';
import { cn } from '@shared/lib/utils';
import { UserActions } from '@features/users/components/actions';
import { ChangeRoleDialog } from '@features/users/components/dialogs';

export type UserDetailsHeaderProps = {
	user: AdminUserDTO;
	isCurrentUser?: boolean;
	onEdit?: () => void;
	onBack?: () => void;
	className?: string;
};

const UserDetailsHeader = ({
	user,
	isCurrentUser = false,
	onEdit,
	onBack,
	className,
}: UserDetailsHeaderProps) => {
	return (
		<div
			className={cn(
				'flex items-start justify-between gap-4',
				'pb-6',
				className
			)}
		>
			{/* ─── Left Side ───────────────────────────── */}
			<div className="space-y-3">
				<Button
					variant="ghost"
					size="sm"
					onClick={onBack}
					className={cn(
						'group',
						'-ml-2',
						'px-2',
						'text-sm font-medium',
						'text-muted-foreground hover:text-foreground'
					)}
				>
					<HugeiconsIcon
						icon={ArrowLeft}
						className="mr-2 size-4 transition-transform group-hover:-translate-x-0.5"
					/>
					Back to users
				</Button>

				<div className="space-y-1">
					<h1 className="text-2xl font-semibold tracking-tight">
						{user.email}
					</h1>
					<p className="text-sm text-muted-foreground">
						Account overview and management
					</p>
				</div>
			</div>

			{/* ─── Right Side ───────────────────────────── */}
			<div className="flex items-center gap-2">
				<ChangeRoleDialog userId={user.id} currentRole={user.role} />

				<UserActions
					userId={user.id}
					isActive={user.isActive}
					isCurrentUser={isCurrentUser}
					onEdit={onEdit}
				/>
			</div>
		</div>
	);
};

export default UserDetailsHeader;
