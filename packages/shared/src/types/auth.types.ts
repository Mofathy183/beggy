import { User } from "@/types";

export enum Role {
    ADMIN = 'ADMIN',
    MEMBER = 'MEMBER',
    MODERATOR = 'MODERATOR',
    USER = 'USER'
}

export enum AuthProvider {
    GOOGLE = 'GOOGLE',
    FACEBOOK = 'FACEBOOK'
}


export enum TokenType {
    EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
    PASSWORD_RESET = 'PASSWORD_RESET',
    CHANGE_EMAIL = 'CHANGE_EMAIL'
}

export enum Subject {
    USER = 'USER',
    BAG = 'BAG',
    ITEM = 'ITEM',
    SUITCASE = 'SUITCASE',
    ROLE = 'ROLE',
    PERMISSION = 'PERMISSION'
}

export enum Scope {
    OWN = 'OWN',
    ANY = 'ANY'
}

export enum Action {
    CREATE = 'CREATE',
    READ = 'READ',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
    MANAGE = 'MANAGE'
}

export type Permissions = { action: Action; scope: Scope; subject: Subject }[]

export interface UserToken {
    id: string
    type: TokenType
    hashToken: string
    expiresAt: Date
    createdAt: Date
    userId: string
    user: User;
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
	rolePermissions: RoleOnPermission[];
}

export interface RoleOnPermissionWithRelations extends RoleOnPermission {
	permission: Permission;
}
