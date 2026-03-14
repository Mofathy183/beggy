'use client';

import { Button } from '@shadcn-ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { Pencil } from '@hugeicons/core-free-icons';

import { ChangeRoleForm } from '@features/users/components/forms';
import type { ChangeRoleInput } from '@beggy/shared/types';
import { FormDialog } from '@shared-ui/dialogs';

type ChangeRoleDialogProps = {
	userId: string;
	currentRole?: ChangeRoleInput['role'];
};

const ChangeRoleDialog = ({ userId, currentRole }: ChangeRoleDialogProps) => {
	return (
		<FormDialog
			trigger={
				<Button variant="outline" size="sm">
					<HugeiconsIcon icon={Pencil} className="mr-2 size-4" />
					Change Role
				</Button>
			}
			form={(onCancel) => (
				<ChangeRoleForm
					userId={userId}
					currentRole={currentRole}
					onCancel={onCancel}
				/>
			)}
		/>
	);
};

export default ChangeRoleDialog;
