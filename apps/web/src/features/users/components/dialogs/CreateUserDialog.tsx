'use client';

import { Button } from '@shadcn-ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { UserPlus } from '@hugeicons/core-free-icons';

import { CreateUserForm } from '@features/users/components/forms';
import { FormDialog } from '@shared-ui/dialogs';

const CreateUserDialog = () => (
	<FormDialog
		trigger={
			<Button>
				<HugeiconsIcon icon={UserPlus} className="mr-2 size-4" />
				Create User
			</Button>
		}
		form={(onCancel) => <CreateUserForm onCancel={onCancel} />}
	/>
);

export default CreateUserDialog;
