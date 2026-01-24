import { Prisma } from '@prisma-generated/client';
import type { PrismaClientType } from '@prisma';

// ============================================================================
// USER STATUS & DISPLAY HELPERS
// ============================================================================

/**
 * Returns a formatted display name (capitalized first + last name)
 */
export function getDisplayName(firstName: string, lastName: string): string {
	if (!firstName?.trim() || !lastName?.trim()) return '';

	const capitalize = (value: string) =>
		value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();

	return `${capitalize(firstName.trim())} ${capitalize(lastName.trim())}`;
}

/**
 * Calculates age from a birth date
 */
export function getAge(
	birthDate: string | Date | null | undefined
): number | null {
	if (!birthDate) return null;

	const date = new Date(birthDate);
	if (isNaN(date.getTime())) return null;

	const today = new Date();
	let age = today.getFullYear() - date.getFullYear();
	const monthDiff = today.getMonth() - date.getMonth();
	const dayDiff = today.getDate() - date.getDate();

	if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
		age--;
	}

	return age;
}

export const profileExtensions = Prisma.defineExtension({
	name: 'ProfileComputedFields',
	result: {
		profile: {
			displayName: {
				needs: { firstName: true, lastName: true },
				compute(user) {
					const { firstName, lastName } = user;
					return getDisplayName(firstName, lastName);
				},
			},
			age: {
				needs: { birthDate: true },
				compute(user) {
					const { birthDate } = user;
					return getAge(birthDate);
				},
			},
		},
	},
});

/**
 * Completely resets the test database.
 *
 * IMPORTANT:
 * - Must be called before each integration test
 * - Order matters due to foreign key constraints
 * - Uses deleteMany (NOT truncate) for Prisma safety
 */
export async function truncateAllTables(
	prisma: PrismaClientType
): Promise<void> {
	// Leaf tables (depend on User)
	await prisma.items.deleteMany();
	await prisma.bags.deleteMany();
	await prisma.suitcases.deleteMany();

	// 1:1 relations
	await prisma.account.deleteMany();
	await prisma.profile.deleteMany();

	// Root table
	await prisma.user.deleteMany();
}
