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
import { UserPlus } from '@hugeicons/core-free-icons';

import { CreateUserForm } from '@features/users/components/forms';

const CreateUserDialog = () => {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{/* Trigger Button */}
			<DialogTrigger>
				<Button>
					<HugeiconsIcon icon={UserPlus} className="mr-2 size-4" />
					Create User
				</Button>
			</DialogTrigger>

			{/* Dialog Content */}
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Create New User</DialogTitle>
				</DialogHeader>

				<CreateUserForm onCancel={() => setOpen(false)} />
			</DialogContent>
		</Dialog>
	);
};

export default CreateUserDialog;
