import prisma from '../../prisma/prisma.js';
import { AbilityBuilder } from '@casl/ability';
import { createPrismaAbility } from '@casl/prisma';

/**
 * Defines the abilities for a given role.
 *
 * @async
 * @function defineAbilitiesFor
 * @param {string} role - The role for which to define the abilities.
 * @returns {Promise<Ability>} - The ability builder for the given role.
 */
export const defineAbilitiesFor = async (role) => {
	// Ability builder
	const { can, build } = new AbilityBuilder(createPrismaAbility);

	// Get the permissions for the role from the database
	const permissions = await prisma.roleOnPermission.findMany({
		where: { role: role },
		include: { permission: true },
	});

	// Add the permissions to the ability builder
	permissions.forEach((perm) => {
		let { action, subject } = perm.permission;
		can(action, subject);
	});

	// Return the ability builder
	return build();
};