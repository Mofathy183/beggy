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
