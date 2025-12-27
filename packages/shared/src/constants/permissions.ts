import { Role, Action, Scope, Subject, Permissions } from "@/types"

// Default permission sets for each role
export const RolePermissions: Record<Role, Permissions> = {
    [Role.ADMIN]: [
        // Full access to everything
        { action: Action.MANAGE, scope: Scope.ANY, subject: Subject.USER },
        { action: Action.MANAGE, scope: Scope.ANY, subject: Subject.BAG },
        { action: Action.MANAGE, scope: Scope.ANY, subject: Subject.ITEM },
        { action: Action.MANAGE, scope: Scope.ANY, subject: Subject.SUITCASE },
        { action: Action.MANAGE, scope: Scope.ANY, subject: Subject.ROLE },
        { action: Action.MANAGE, scope: Scope.ANY, subject: Subject.PERMISSION },
    ],
    [Role.MODERATOR]: [
        // Can manage content but not users
        { action: Action.MANAGE, scope: Scope.ANY, subject: Subject.BAG },
        { action: Action.MANAGE, scope: Scope.ANY, subject: Subject.ITEM },
        { action: Action.MANAGE, scope: Scope.ANY, subject: Subject.SUITCASE },
        { action: Action.READ, scope: Scope.ANY, subject: Subject.USER },
    ],
    [Role.MEMBER]: [
        // Extended permissions for paying members
        { action: Action.CREATE, scope: Scope.ANY, subject: Subject.BAG },
        { action: Action.READ, scope: Scope.ANY, subject: Subject.BAG },
        { action: Action.UPDATE, scope: Scope.OWN, subject: Subject.BAG },
        { action: Action.DELETE, scope: Scope.OWN, subject: Subject.BAG },
        { action: Action.MANAGE, scope: Scope.OWN, subject: Subject.ITEM },
        { action: Action.MANAGE, scope: Scope.OWN, subject: Subject.SUITCASE },
    ],
    [Role.USER]: [
        // Basic user permissions
        { action: Action.CREATE, scope: Scope.OWN, subject: Subject.BAG },
        { action: Action.READ, scope: Scope.OWN, subject: Subject.BAG },
        { action: Action.UPDATE, scope: Scope.OWN, subject: Subject.BAG },
        { action: Action.DELETE, scope: Scope.OWN, subject: Subject.BAG },
        { action: Action.MANAGE, scope: Scope.OWN, subject: Subject.ITEM },
        { action: Action.READ, scope: Scope.OWN, subject: Subject.USER },
        { action: Action.UPDATE, scope: Scope.OWN, subject: Subject.USER },
    ],
};
