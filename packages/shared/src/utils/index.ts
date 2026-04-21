export * from './schema.util';

// ─── Shared helper ────────────────────────────────────────────────────────────
//
// Translates your domain Action enum to CASL's internal action string.
//
// CASL's superaction is the literal string 'manage' (lowercase).
// Your enum stores 'MANAGE' (uppercase) because Prisma requires it.
// This adapter is the single translation point — nowhere else needs
// to know about this distinction.
//
export const toCaslAction = (action: string): string =>
	action === 'MANAGE' ? 'manage' : action;
