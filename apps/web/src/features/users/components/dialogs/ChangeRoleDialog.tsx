'use client';

import { useState } from 'react';

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@shadcn-ui/dialog';

import { Button } from '@shadcn-ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { Pencil } from '@hugeicons/core-free-icons';

import { ChangeRoleForm } from '@features/users/components/forms';
import type { ChangeRoleInput } from '@beggy/shared/types';

type Props = {
	userId: string;
	currentRole?: ChangeRoleInput['role'];
};

const ChangeRoleDialog = ({ userId, currentRole }: Props) => {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{/* Trigger */}
			<DialogTrigger>
				<Button variant="outline" size="sm">
					<HugeiconsIcon icon={Pencil} className="mr-2 size-4" />
					Change Role
				</Button>
			</DialogTrigger>

			{/* Content */}
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Change User Role</DialogTitle>
				</DialogHeader>

				<ChangeRoleForm
					userId={userId}
					currentRole={currentRole}
					onCancel={() => setOpen(false)}
				/>
			</DialogContent>
		</Dialog>
	);
};

export default ChangeRoleDialog;
