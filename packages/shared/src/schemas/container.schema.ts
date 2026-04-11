import { z } from 'zod';
import { FieldsSchema } from './fields.schema';

/**
 * Shared field definitions for operations that act on a specific item.
 *
 * @remarks
 * Centralizing this ensures consistent validation across `pack`, `unpack`, and `move`
 * while avoiding schema drift between operations.
 */
const packingSchema = {
	itemId: FieldsSchema.id(
		'That item ID doesn’t look right — give it another quick check and we’ll get things moving.'
	),
	quantity: FieldsSchema.number('item', 'quantity'),
};

/**
 * Container operation validation schemas.
 *
 * @description
 * Defines the input contracts for all container-related mutations.
 * These schemas are shared across API and client to guarantee identical
 * validation behavior and error messaging.
 *
 * @remarks
 * - All schemas are strict to prevent accidental or malicious extra fields
 * - Quantity constraints (e.g. positive integer) are enforced at the field level
 */
export const ContainerSchema = {
	/**
	 * Payload for adding an item to a container.
	 */
	pack: z.strictObject(packingSchema),

	/**
	 * Payload for removing an item from a container.
	 */
	unpack: z.strictObject(packingSchema),

	/**
	 * Payload for moving an item between containers.
	 *
	 * @description
	 * Extends the base packing schema with source and destination containers.
	 * Includes a domain-level validation to prevent no-op moves.
	 *
	 * @throws {z.ZodError}
	 * Thrown when:
	 * - Either container ID is invalid
	 * - Source and destination containers are identical
	 */
	move: z
		.strictObject({
			fromContainerId: FieldsSchema.id(
				'I couldn’t recognize the starting container — might be worth a quick double-check.'
			),
			toContainerId: FieldsSchema.id(
				'This destination container doesn’t seem valid — let’s make sure it’s the right one.'
			),
			...packingSchema,
		})
		.superRefine(({ fromContainerId, toContainerId }, ctx) => {
			// Prevent no-op moves (same source and destination)
			if (fromContainerId === toContainerId) {
				ctx.addIssue({
					code: 'custom',
					path: ['toContainerId'],
					message:
						"Looks like you're moving items to the same place — try picking a different destination so this actually does something useful.",
				});
			}
		}),
};
