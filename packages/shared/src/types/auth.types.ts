export type Role = 'ADMIN' | 'MEMBER' | 'SUBSCRIBER' | 'USER';

export type AuthProvider = 'GOOGLE' | 'FACEBOOK';

export type TokenType =
	| 'EMAIL_VERIFICATION'
	| 'PASSWORD_RESET'
	| 'CHANGE_EMAIL';

export type Subject =
	| 'USER'
	| 'BAG'
	| 'ITEM'
	| 'SUITCASE'
	| 'ROLE'
	| 'PERMISSION';
export type Scope = 'OWN' | 'ANY';
export type Action = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'MANAGE';

export interface UserToken {
	id: string;
	type: TokenType;
	hashToken: string;
	expiresAt: Date;
	createdAt: Date;
	userId: string;
}

export interface Permission {
	/**
	 * Primary identifier
	 */
	id: string;
	/**
	 * The action (CREATE/READ/UPDATE/DELETE/MANAGE)
	 */
	action: Action;
	/**
	 * Whether the permission applies to OWN or ANY resource
	 */
	scope: Scope;
	/**
	 * The resource type this permission applies to
	 */
	subject: Subject;
}

export interface RoleOnPermission {
	/**
	 * Primary identifier
	 */
	id: string;
	/**
	 * The role assigned in this mapping
	 */
	role: Role;
	/**
	 * Foreign key to Permission
	 */
	permissionId: string;
}

export interface PermissionWithRelations extends Permission {
	rolePermissions: RoleOnPermission;
}

export interface RoleOnPermissionWithRelations extends RoleOnPermission {
	permission: Permission;
}
