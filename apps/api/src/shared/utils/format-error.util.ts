import { z } from 'zod';
import type { ValidationFieldErrors, ZodErrorTree } from '@shared/types';

/**
 * Recursively formats a single Zod error tree node into a ValidationFieldErrors structure.
 *
 * This function walks the output of `z.treeifyError()` and:
 * - Treats nodes with direct errors as leaf nodes
 * - Recursively processes nested object properties
 * - Recursively processes array item errors using index-based keys
 * - Omits empty branches to keep the output minimal and meaningful
 *
 * This function is internal and should not be used directly outside
 * of validation error formatting utilities.
 *
 * @param node - A single node from Zod's treeifyError error structure
 * @returns A ValidationFieldErrors subtree, or `undefined` if the node contains no errors
 */
const formatNode = (node: ZodErrorTree): ValidationFieldErrors | undefined => {
	// Leaf node:
	// If this node contains direct validation errors, return them immediately.
	// Zod guarantees these error messages are strings at runtime.
	if (node.errors.length > 0) {
		return node.errors.filter((e): e is string => typeof e === 'string');
	}

	// Container for nested validation errors
	const result: Record<string, ValidationFieldErrors> = {};
	let hasErrors = false;

	// Handle nested object properties (e.g. schema.shape fields)
	if (node.properties) {
		for (const key of Object.keys(node.properties)) {
			const propertyNode = node.properties[key];

			// Defensive check: ensure the property node exists
			if (propertyNode) {
				const formatted = formatNode(propertyNode);
				if (formatted !== undefined) {
					hasErrors = true;
					result[key] = formatted;
				}
			}
		}
	}

	// Handle array item errors (index-based validation)
	if (node.items) {
		const itemsResult: Record<string, ValidationFieldErrors> = {};

		node.items.forEach((item, index) => {
			const formatted = formatNode(item);
			if (formatted !== undefined) {
				hasErrors = true;
				itemsResult[index.toString()] = formatted;
			}
		});

		// Only include array errors if at least one item produced validation output
		if (Object.keys(itemsResult).length > 0) {
			result.items = itemsResult;
		}
	}

	// Return undefined when this branch has no validation errors
	return hasErrors ? result : undefined;
};

/**
 * Converts a Zod `treeifyError` result into a `ValidationFieldErrors` structure.
 *
 * This function serves as the public entry point for formatting Zod validation errors.
 * It encapsulates Zod-specific error structures and returns a stable,
 * API-friendly validation error tree.
 *
 * This function is typically used in:
 * - Global error-handling middleware
 * - Validation pipelines before controller execution
 *
 * @param tree - The output of `z.treeifyError(error)`
 * @returns A nested validation error structure, or `undefined` if no validation errors exist
 */
export const formatValidationError = (
	tree: ReturnType<typeof z.treeifyError>
): ValidationFieldErrors | undefined => {
	// Cast is safe: this utility operates on the known runtime structure
	// produced by `z.treeifyError()`
	return formatNode(tree as ZodErrorTree);
};
