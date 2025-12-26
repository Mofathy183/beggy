const USER_PERMISSIONS = [
	{ action: 'create:own', subject: ['bag', 'item', 'suitcase'] },
	{ action: 'read:own', subject: ['bag', 'item', 'suitcase', 'user'] },
	{ action: 'update:own', subject: ['bag', 'item', 'suitcase', 'user'] },
	{ action: 'delete:own', subject: ['bag', 'item', 'suitcase', 'user'] },
];

const SUBSCRIBER_PERMISSIONS = [...USER_PERMISSIONS];

const MEMBER_PERMISSIONS = [
	...SUBSCRIBER_PERMISSIONS,
	...SUBSCRIBER_PERMISSIONS.map((perm) => {
		return { ...perm, action: perm.action.replace(':own', ':any') };
	}),
];

const ADMIN_PERMISSIONS = [
	...MEMBER_PERMISSIONS.map((perm) => {
		return perm.action.includes(':any')
			? {
					...perm,
					subject: [...perm.subject, 'user'],
				}
			: { ...perm };
	}),
	{ action: 'manage:any', subject: ['role', 'permission'] },
];
